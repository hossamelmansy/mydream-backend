const { SchemaDirectiveVisitor, gql } = require("apollo-server-express");
const { defaultFieldResolver } = require("graphql");

const { ERRORS, throwError } = require("../../utils/index");

// TypeDef
const typeDef = gql`
  directive @auth(
    requires: UserRole = USER
    allowSelf: Boolean = false
  ) on OBJECT | FIELD_DEFINITION | MUTATION | QUERY | SUBSCRIPTION

  enum UserRole {
    ADMIN
    USER
  }
`;

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
    type._allowself = this.args.allowSelf;
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
    field._allowself = this.args.allowSelf;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async (parent, args, context, info) => {
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;
        const allowSelf = field._allowself || objectType._allowself;

        // If no auth required, then resolve
        if (!requiredRole) {
          return resolve.apply(this, [parent, args, context, info]);
        }

        const { user } = context; // Get user from resolver context
        // If there's no user, throw error
        if (!user) {
          throwError(ERRORS.AUTHENTICATION);
        }

        const userRoles = user.roles.map(role => role.toUpperCase()) || []; // Get user roles
        const hasRole = userRoles.includes(requiredRole); // If user has required role

        // If user doesn't have this role and doesn't enable (allowSelf), throw error
        if (!hasRole && !allowSelf) {
          throwError(ERRORS.FORBIDDEN);
        }

        const result = await resolve.apply(this, [parent, args, context, info]);
        let isSelf = false;
        if (info.returnType.name == "User" && result._id == user._id) {
          isSelf = true;
        }
        if (info.parentType.name == "User" && parent._id && user._id) {
          isSelf = true;
        }

        if (!hasRole && !isSelf) {
          throwError(ERRORS.FORBIDDEN);
        }

        return result;
      };
    });
  }
}

module.exports = {
  typeDef,
  directive: { auth: AuthDirective },
};
