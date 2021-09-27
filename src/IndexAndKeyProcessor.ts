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
import DBAccessQueryResult from './DBAccessQueryResult';
import IDBAccessQueryParams from './IDBAccessQueryParams';
import * as extraConfigProcessor from './ExtraConfigProcessor';

/**
 * Returns PostgreSQL index type, that correlates to given MySQL index type.
 */
const getIndexType = (conversion: Conversion, indexType: string): string => {
    return indexType in conversion._indexTypesMap ? conversion._indexTypesMap[indexType] : 'BTREE';
};

/**
 * Creates primary key and indices.
 */
export default async (conversion: Conversion, tableName: string): Promise<void> => {
    const logTitle: string = 'IndexAndKeyProcessor::default';
    const originalTableName: string = extraConfigProcessor.getTableName(conversion, tableName, true);
    const params: IDBAccessQueryParams = {
        conversion: conversion,
        caller: logTitle,
        sql: `SHOW INDEX FROM \`${ originalTableName }\`;`,
        vendor: DBVendors.MYSQL,
        processExitOnError: false,
        shouldReturnClient: false
    };

    const showIndexResult: DBAccessQueryResult = await DBAccess.query(params);

    if (showIndexResult.error) {
        return;
    }

    const objPgIndices: any = Object.create(null);
    let cnt: number = 0;
    let indexType: string = '';

    showIndexResult.data.forEach((index: any) => {
        const pgColumnName: string = extraConfigProcessor.getColumnName(conversion, originalTableName, index.Column_name, false);

        if (index.Key_name in objPgIndices) {
            objPgIndices[index.Key_name].column_name.push(`"${ pgColumnName }"`);
            return;
        }

        objPgIndices[index.Key_name] = {
            is_unique: index.Non_unique === 0,
            column_name: [`"${ pgColumnName }"`],
            index_type: ` USING ${ getIndexType(conversion, index.Index_type) }`,
        };
    });

    let createdIndexes = new Array();

    const addIndexPromises: Promise<void>[] = Object.keys(objPgIndices).map(async (index: string) => {
        let sqlAddIndex: string = '';

        if (index.toLowerCase() === 'primary') {
            indexType = 'PK';
            sqlAddIndex = `ALTER TABLE "${ conversion._schema }"."${ tableName }" 
                ADD PRIMARY KEY(${ objPgIndices[index].column_name.join(',') });`;
        } else {
            // OLD STYLE
            // "schema_idxname_{integer}_idx" - is NOT a mistake.
            // https://github.com/AnatolyUss/nmig/issues/39
            //const columnName: string = objPgIndices[index].column_name[0].slice(1, -1) + cnt++;

            // NEW STYLE
            let cntPrefix = 1;
            let columnName: string = objPgIndices[index].column_name[0].slice(1, -1);
            while (createdIndexes.length && createdIndexes.indexOf(columnName) !== -1) {
                columnName = objPgIndices[index].column_name[0].slice(1, -1) + "_" + cntPrefix;
                cntPrefix++;
            }
            createdIndexes.push(columnName);

            // find in partial indexes
            let columns = objPgIndices[index].column_name;
            if (conversion._partialIndexes && conversion._partialIndexes.hasOwnProperty(index)) {
                let partialIdxColumns = conversion._partialIndexes[index];
                let colName;
                for (let i = 0; i < columns.length; i++) {
                    colName = columns[i];
                    if (colName.charAt(0) === "\"" && colName.charAt(colName.length-1) === "\"") {
                        colName = colName.substring(1, colName.length-1);
                    }

                    if (partialIdxColumns.hasOwnProperty(colName)) {
                        const length = partialIdxColumns[colName];
                        columns[i] = `"left"(${colName}, ${length})`;
                    }
                }
            }

            indexType = 'index';

            // old index naming
            //sqlAddIndex = `CREATE ${ (objPgIndices[index].is_unique ? 'UNIQUE ' : '') }INDEX "${ conversion._schema }_${ tableName }_${ columnName }_idx"

            sqlAddIndex = `CREATE ${ (objPgIndices[index].is_unique ? 'UNIQUE ' : '') }INDEX "${ tableName }_${ columnName }_idx" 
            ON "${ conversion._schema }"."${ tableName }" 
            ${ objPgIndices[index].index_type } (${ columns.join(',') });`;
        }

        params.vendor = DBVendors.PG;
        params.sql = sqlAddIndex;
        await DBAccess.query(params);
    });

    await Promise.all(addIndexPromises);
    const successMsg: string = `\t--[${ logTitle }] "${ conversion._schema }"."${ tableName }": PK/indices are successfully set...`;
    log(conversion, successMsg, conversion._dicTables[tableName].tableLogPath);
};
