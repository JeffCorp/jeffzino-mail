const { ROLES } = require("../../constants/enums");
const _ = require("lodash");

module.exports.hasPermission = (req, opName, permission) => {
    let response = false;
    let { meta } = req.userData;
    try {
        if (!meta || !meta.permissions) throw new Error("No User Permissions found")
        switch (opName) {
            case 'create-user-account':
                // get the user role of the new account
                const { short_name } = req.body.role;
                // check the user's role to determine which checks to be made
                // ...
                // ensure that the user can create an account with ROOT permission
                if (short_name == ROLES.ROOT && _.find(meta.permissions, function (perm) {
                    return perm == 'crud-root-user'
                }
                )) response = true;
                if (short_name == ROLES.CA && _.find(meta.permissions, function (perm) {
                    return perm == 'crud-ca-user'
                }
                )) response = true;
                if (short_name == ROLES.SA && _.find(meta.permissions, function (perm) {
                    return perm == 'crud-sa-user'
                }
                )) response = true;
                if (short_name == ROLES.HA && _.find(meta.permissions, function (perm) {
                    return perm == 'crud-ha-user'
                }
                )) response = true;
                if (short_name == ROLES.IA && _.find(meta.permissions, function (perm) {
                    return perm == 'crud-ia-user'
                }
                )) response = true;
                if (short_name == ROLES.US) response = true;
                break;

            default:
                if (_.find(meta.permissions, function (perm) {
                    return perm == permission
                })) response = true;
                break;
        }
    } catch (error) {
        console.error(error);
        response = false
    }
    return response;
}

module.exports.genQueryParams = (customName, query, req, callback) => {
    let orQueries = _.find(req.query, function (query, index) { return (index == '$or') });
    let tempOr = [];
    if (orQueries) {
        if (typeof (orQueries) == "object") {
            _.forEach(orQueries, function (_query) {
                let queryOpt = _.split(_query, ":");
                let dummy = new Object();
                dummy[queryOpt[0]] = queryOpt[1];
                tempOr.push(dummy);
            })
        } else {
            let queryOpt = _.split(orQueries, ":");
            let dummy = new Object();
            dummy[queryOpt[0]] = queryOpt[1];
            tempOr.push(dummy);
        }
    }
    if (!_.isEmpty(query) && !_.isEmpty(query.$or)) tempOr = _.concat(tempOr, query.$or);
    if (_.size(tempOr) > 0) query = { ...query, $or: tempOr }

    const paths = _.find(req.query, function (query, index) { return (index == '$include') });
    let options = {
        populate: paths,
        sort: { createdAt: "desc" },
        page: Number(_.find(req.query, function (query, index) { return (index == '$page') })) || 1,
        limit: Number(_.find(req.query, function (query, index) { return (index == '$limit') })) || 10,
        customLabels: {
            docs: customName
        },
        lean: true
    }
    let results = {
        query,
        options
    };
    if (callback) return callback(results)
    return results;
}