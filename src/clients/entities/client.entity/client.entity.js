"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var typeorm_1 = require("typeorm");
var Client = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('clients')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _api_client_id_decorators;
    var _api_client_id_initializers = [];
    var _api_client_id_extraInitializers = [];
    var _username_decorators;
    var _username_initializers = [];
    var _username_extraInitializers = [];
    var _email_enc_decorators;
    var _email_enc_initializers = [];
    var _email_enc_extraInitializers = [];
    var _email_hash_decorators;
    var _email_hash_initializers = [];
    var _email_hash_extraInitializers = [];
    var _first_name_enc_decorators;
    var _first_name_enc_initializers = [];
    var _first_name_enc_extraInitializers = [];
    var _middle_name_enc_decorators;
    var _middle_name_enc_initializers = [];
    var _middle_name_enc_extraInitializers = [];
    var _last_name_enc_decorators;
    var _last_name_enc_initializers = [];
    var _last_name_enc_extraInitializers = [];
    var _account_number_decorators;
    var _account_number_initializers = [];
    var _account_number_extraInitializers = [];
    var _created_at_decorators;
    var _created_at_initializers = [];
    var _created_at_extraInitializers = [];
    var Client = _classThis = /** @class */ (function () {
        function Client_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.api_client_id = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _api_client_id_initializers, void 0));
            this.username = (__runInitializers(this, _api_client_id_extraInitializers), __runInitializers(this, _username_initializers, void 0));
            this.email_enc = (__runInitializers(this, _username_extraInitializers), __runInitializers(this, _email_enc_initializers, void 0));
            this.email_hash = (__runInitializers(this, _email_enc_extraInitializers), __runInitializers(this, _email_hash_initializers, void 0));
            this.first_name_enc = (__runInitializers(this, _email_hash_extraInitializers), __runInitializers(this, _first_name_enc_initializers, void 0));
            this.middle_name_enc = (__runInitializers(this, _first_name_enc_extraInitializers), __runInitializers(this, _middle_name_enc_initializers, void 0));
            this.last_name_enc = (__runInitializers(this, _middle_name_enc_extraInitializers), __runInitializers(this, _last_name_enc_initializers, void 0));
            this.account_number = (__runInitializers(this, _last_name_enc_extraInitializers), __runInitializers(this, _account_number_initializers, void 0));
            this.created_at = (__runInitializers(this, _account_number_extraInitializers), __runInitializers(this, _created_at_initializers, void 0));
            __runInitializers(this, _created_at_extraInitializers);
        }
        return Client_1;
    }());
    __setFunctionName(_classThis, "Client");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _api_client_id_decorators = [(0, typeorm_1.Column)()];
        _username_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _email_enc_decorators = [(0, typeorm_1.Column)()];
        _email_hash_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _first_name_enc_decorators = [(0, typeorm_1.Column)()];
        _middle_name_enc_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _last_name_enc_decorators = [(0, typeorm_1.Column)()];
        _account_number_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _created_at_decorators = [(0, typeorm_1.CreateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _api_client_id_decorators, { kind: "field", name: "api_client_id", static: false, private: false, access: { has: function (obj) { return "api_client_id" in obj; }, get: function (obj) { return obj.api_client_id; }, set: function (obj, value) { obj.api_client_id = value; } }, metadata: _metadata }, _api_client_id_initializers, _api_client_id_extraInitializers);
        __esDecorate(null, null, _username_decorators, { kind: "field", name: "username", static: false, private: false, access: { has: function (obj) { return "username" in obj; }, get: function (obj) { return obj.username; }, set: function (obj, value) { obj.username = value; } }, metadata: _metadata }, _username_initializers, _username_extraInitializers);
        __esDecorate(null, null, _email_enc_decorators, { kind: "field", name: "email_enc", static: false, private: false, access: { has: function (obj) { return "email_enc" in obj; }, get: function (obj) { return obj.email_enc; }, set: function (obj, value) { obj.email_enc = value; } }, metadata: _metadata }, _email_enc_initializers, _email_enc_extraInitializers);
        __esDecorate(null, null, _email_hash_decorators, { kind: "field", name: "email_hash", static: false, private: false, access: { has: function (obj) { return "email_hash" in obj; }, get: function (obj) { return obj.email_hash; }, set: function (obj, value) { obj.email_hash = value; } }, metadata: _metadata }, _email_hash_initializers, _email_hash_extraInitializers);
        __esDecorate(null, null, _first_name_enc_decorators, { kind: "field", name: "first_name_enc", static: false, private: false, access: { has: function (obj) { return "first_name_enc" in obj; }, get: function (obj) { return obj.first_name_enc; }, set: function (obj, value) { obj.first_name_enc = value; } }, metadata: _metadata }, _first_name_enc_initializers, _first_name_enc_extraInitializers);
        __esDecorate(null, null, _middle_name_enc_decorators, { kind: "field", name: "middle_name_enc", static: false, private: false, access: { has: function (obj) { return "middle_name_enc" in obj; }, get: function (obj) { return obj.middle_name_enc; }, set: function (obj, value) { obj.middle_name_enc = value; } }, metadata: _metadata }, _middle_name_enc_initializers, _middle_name_enc_extraInitializers);
        __esDecorate(null, null, _last_name_enc_decorators, { kind: "field", name: "last_name_enc", static: false, private: false, access: { has: function (obj) { return "last_name_enc" in obj; }, get: function (obj) { return obj.last_name_enc; }, set: function (obj, value) { obj.last_name_enc = value; } }, metadata: _metadata }, _last_name_enc_initializers, _last_name_enc_extraInitializers);
        __esDecorate(null, null, _account_number_decorators, { kind: "field", name: "account_number", static: false, private: false, access: { has: function (obj) { return "account_number" in obj; }, get: function (obj) { return obj.account_number; }, set: function (obj, value) { obj.account_number = value; } }, metadata: _metadata }, _account_number_initializers, _account_number_extraInitializers);
        __esDecorate(null, null, _created_at_decorators, { kind: "field", name: "created_at", static: false, private: false, access: { has: function (obj) { return "created_at" in obj; }, get: function (obj) { return obj.created_at; }, set: function (obj, value) { obj.created_at = value; } }, metadata: _metadata }, _created_at_initializers, _created_at_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Client = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Client = _classThis;
}();
exports.Client = Client;
