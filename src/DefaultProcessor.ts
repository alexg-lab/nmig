/*
 * This file is a part of "NMIG" - the database migration tool.
 *
 * Copyright (C) 2016 - present, Anatoly Khaytovich <anatolyuss@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program (please see the "LICENSE.md" file).
 * If not, see <http://www.gnu.org/licenses/gpl.txt>.
 *
 * @author Anatoly Khaytovich <anatolyuss@gmail.com>
 */
import { log } from './FsOps';
import Conversion from './Conversion';
import DBAccess from './DBAccess';
import DBVendors from './DBVendors';
import * as extraConfigProcessor from './ExtraConfigProcessor';
import { mapDataTypes } from './TableProcessor';
import DBAccessQueryResult from './DBAccessQueryResult';
import IDBAccessQueryParams from './IDBAccessQueryParams';

/**
 * Defines which columns of the given table have default value.
 * Sets default values, if need.
 */
export default async (conversion: Conversion, tableName: string): Promise<void> => {
    const logTitle: string = 'DefaultProcessor::default';
    const msg: string = `\t--[${ logTitle }] Defines default values for table: "${ conversion._schema }"."${ tableName }"`;
    log(conversion, msg, conversion._dicTables[tableName].tableLogPath);
    const originalTableName: string = extraConfigProcessor.getTableName(conversion, tableName, true);
    const pgSqlNumericTypes: string[] = ['money', 'numeric', 'decimal', 'double precision', 'real', 'bigint', 'int', 'smallint'];
    const sqlReservedValues: any = {
        'CURRENT_DATE': 'CURRENT_DATE',
        '0000-00-00': "'-INFINITY'",
        'CURRENT_TIME': 'CURRENT_TIME',
        '00:00:00': '00:00:00',
        'CURRENT_TIMESTAMP': 'CURRENT_TIMESTAMP',
        '0000-00-00 00:00:00': "'-INFINITY'",
        'LOCALTIME': 'LOCALTIME',
        'LOCALTIMESTAMP': 'LOCALTIMESTAMP',
        'NULL': 'NULL',
        'null': 'NULL',
        'UTC_DATE': "(CURRENT_DATE AT TIME ZONE 'UTC')",
        'UTC_TIME': "(CURRENT_TIME AT TIME ZONE 'UTC')",
        'UTC_TIMESTAMP': "(NOW() AT TIME ZONE 'UTC')",

        'CURRENT_DATE()': 'CURRENT_DATE',
        'CURRENT_TIME()': 'CURRENT_TIME',
        'CURRENT_TIMESTAMP()': 'CURRENT_TIMESTAMP',
        'CURRENT_TIMESTAMP(3)': 'CURRENT_TIMESTAMP(3)',
        'LOCALTIME()': 'LOCALTIME',
        'LOCALTIMESTAMP()': 'LOCALTIMESTAMP',
        'UTC_DATE()': "(CURRENT_DATE AT TIME ZONE 'UTC')",
        'UTC_TIME()': "(CURRENT_TIME AT TIME ZONE 'UTC')",
        'UTC_TIMESTAMP()': "(NOW() AT TIME ZONE 'UTC')",
        //'\'null\'': 'NULL',
        //'"null"': 'NULL',
    };

    const promises: Promise<void>[] = conversion._dicTables[tableName].arrTableColumns.map(async (column: any) => {
        const pgSqlDataType: string = mapDataTypes(conversion, conversion._dataTypesMap, column.Type);
        const columnName: string = extraConfigProcessor.getColumnName(conversion, originalTableName, column.Field, false);
        let sql: string = `ALTER TABLE "${ conversion._schema }"."${ tableName }" ALTER COLUMN "${ columnName }" SET DEFAULT `;

        let columnDefaultUpper = column.Default;
        if (typeof(column.Default) === 'string') {
            columnDefaultUpper = column.Default.toUpperCase();
        }

        // Fix for null::character varying / null::number / etc in Default Values
        // Do not add default NULL
        if (!conversion._set_column_default_null && column.Default === null) {
            const successMsg: string = `\t--[${ logTitle }] Without default value for "${ conversion._schema }"."${ tableName }"."${ columnName }"...`;
            log(conversion, successMsg, conversion._dicTables[tableName].tableLogPath);

            return;
        }

        // Do not add default NULL only for NOT NULL columns
        /*if (!conversion._set_column_default_null && column.Null.toLowerCase() === 'no' && column.Default === null) {
            const successMsg: string = `\t--[${ logTitle }] Without default value for "${ conversion._schema }"."${ tableName }"."${ columnName }"...`;
            log(conversion, successMsg, conversion._dicTables[tableName].tableLogPath);

            return;
        }*/

        if (sqlReservedValues[columnDefaultUpper]) {
            sql += `${ sqlReservedValues[columnDefaultUpper] };`;
        } else if (pgSqlNumericTypes.indexOf(pgSqlDataType) === -1) {
            sql += `'${ column.Default }';`;
        } else {
            sql += `${ column.Default };`;
        }

        const params: IDBAccessQueryParams = {
            conversion: conversion,
            caller: logTitle,
            sql: sql,
            vendor: DBVendors.PG,
            processExitOnError: false,
            shouldReturnClient: false
        };

        const result: DBAccessQueryResult = await DBAccess.query(params);

        if (!result.error) {
            const successMsg: string = `\t--[${ logTitle }] Set default value for "${ conversion._schema }"."${ tableName }"."${ columnName }"...`;
            log(conversion, successMsg, conversion._dicTables[tableName].tableLogPath);
        }
    });

    await Promise.all(promises);
};
