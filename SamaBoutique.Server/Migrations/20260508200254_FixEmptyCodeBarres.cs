using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SamaBoutique.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixEmptyCodeBarres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Assign a unique internal EAN-13 to products that have an empty CodeBarres.
            // The WHILE loop handles the (extremely unlikely) collision case.
            migrationBuilder.Sql(@"
                DECLARE @id UNIQUEIDENTIFIER;
                DECLARE @code VARCHAR(13);
                DECLARE @check INT;
                DECLARE @digits VARCHAR(12);
                DECLARE @sum INT;

                DECLARE cur CURSOR FOR
                    SELECT Id FROM [Products] WHERE [CodeBarres] = '' OR [CodeBarres] IS NULL;

                OPEN cur;
                FETCH NEXT FROM cur INTO @id;

                WHILE @@FETCH_STATUS = 0
                BEGIN
                    SET @code = NULL;
                    WHILE @code IS NULL OR EXISTS (SELECT 1 FROM [Products] WHERE [CodeBarres] = @code)
                    BEGIN
                        -- Préfixe '2' + 11 chiffres aléatoires
                        SET @digits = '2'
                            + CAST(CAST(RAND() * 9999999999 AS BIGINT) % 100000000000 AS VARCHAR(11));
                        -- Pad to 12 chars
                        SET @digits = RIGHT('000000000000' + @digits, 12);
                        -- Chiffre de contrôle EAN-13
                        SET @sum =
                              CAST(SUBSTRING(@digits,1,1) AS INT) * 1
                            + CAST(SUBSTRING(@digits,2,1) AS INT) * 3
                            + CAST(SUBSTRING(@digits,3,1) AS INT) * 1
                            + CAST(SUBSTRING(@digits,4,1) AS INT) * 3
                            + CAST(SUBSTRING(@digits,5,1) AS INT) * 1
                            + CAST(SUBSTRING(@digits,6,1) AS INT) * 3
                            + CAST(SUBSTRING(@digits,7,1) AS INT) * 1
                            + CAST(SUBSTRING(@digits,8,1) AS INT) * 3
                            + CAST(SUBSTRING(@digits,9,1) AS INT) * 1
                            + CAST(SUBSTRING(@digits,10,1) AS INT) * 3
                            + CAST(SUBSTRING(@digits,11,1) AS INT) * 1
                            + CAST(SUBSTRING(@digits,12,1) AS INT) * 3;
                        SET @check = (10 - (@sum % 10)) % 10;
                        SET @code = @digits + CAST(@check AS VARCHAR(1));
                    END;

                    UPDATE [Products] SET [CodeBarres] = @code WHERE [Id] = @id;
                    FETCH NEXT FROM cur INTO @id;
                END;

                CLOSE cur;
                DEALLOCATE cur;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot reverse auto-generated barcodes — no-op
        }
    }
}
