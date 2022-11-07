#!/bin/bash
echo "Creating database";
mysql -u root -p < "create_database.sql";
for filename in ./*table*.sql; do
    echo "executing $filename";
    mysql -u root -p dcbotting < $filename;
done