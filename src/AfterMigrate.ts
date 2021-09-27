/*
 * @author Alexander Garashko <mcdesperado@gmail.com>
 */
import DBAccess from './DBAccess';
import DBAccessQueryResult from './DBAccessQueryResult';
import IDBAccessQueryParams from './IDBAccessQueryParams';
import DBVendors from './DBVendors';
import { log } from './FsOps';
import Conversion from './Conversion';

/**
 * AfterMigrate
 *
 * @param conversion
 */
export const afterMigrate = async (conversion: Conversion): Promise<Conversion> => {
    if (conversion._after_migrate_sqls.length === 0) {
        return conversion;
    }

    const logTitle: string = 'AfterMigrate';

    let params: IDBAccessQueryParams = {
        conversion: conversion,
        caller: logTitle,
        sql: "",
        vendor: DBVendors.PG,
        processExitOnError: true,
        shouldReturnClient: true
    };
    let result: DBAccessQueryResult;

    let sql: string;
    for (let i = 0; i < conversion._after_migrate_sqls.length; i++) {
        sql = conversion._after_migrate_sqls[i];
        params.sql = sql;
        result = await DBAccess.query(params);

        if (!result.error) {
            const msg: string = `\t--[${ logTitle }] sql finished:\r\n\t${ sql }\r\n`;
            log(conversion, msg);
        }
    }

    return conversion;
};
