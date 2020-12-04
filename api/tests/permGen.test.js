const _ = require("lodash");
const permissions = require("../data/permissions.json");

const data = {
    role: {
        short_name: "ROOT"
    }
};

if (data.role && typeof (data.role) == "object") {
    // get default permissions
    const defPerms = [];
    _.forEach(permissions, function (perm, index) {
        if (perm.isDefault) {
            let permission = _.find(perm.defaultRoles, function (role, i) { return role == data.role.short_name });
            if (permission) {
                defPerms.push(perm.short_name)
            }
        }
    })
    console.log(defPerms);
} else {
    console.log("path data.role is not an object")
}
