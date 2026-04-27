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
exports.EncryptionService = void 0;
var crypto = require("crypto");
var common_1 = require("@nestjs/common");
var EncryptionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var EncryptionService = _classThis = /** @class */ (function () {
        function EncryptionService_1(config) {
            this.config = config;
            var encKey = this.config.get('APP_ENCRYPTION_KEY');
            var hmacKey = this.config.get('APP_HMAC_KEY');
            if (!encKey || !hmacKey) {
                throw new Error('Encryption keys missing in .env');
            }
            this.encryptionKey = Buffer.from(encKey, 'hex');
            this.hmacKey = Buffer.from(hmacKey, 'hex');
        }
        EncryptionService_1.prototype.encrypt = function (plaintext) {
            var iv = crypto.randomBytes(16);
            var cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
            var ciphertext = Buffer.concat([
                cipher.update(plaintext, 'utf8'),
                cipher.final(),
            ]);
            var hmac = crypto
                .createHmac('sha256', this.hmacKey)
                .update(ciphertext)
                .digest();
            return Buffer.concat([iv, hmac, ciphertext]).toString('base64');
        };
        EncryptionService_1.prototype.decrypt = function (encrypted) {
            try {
                var data = Buffer.from(encrypted, 'base64');
                if (data.length < 48)
                    return null;
                var iv = data.subarray(0, 16);
                var hmac = data.subarray(16, 48);
                var ciphertext = data.subarray(48);
                var calcHmac = crypto
                    .createHmac('sha256', this.hmacKey)
                    .update(ciphertext)
                    .digest();
                if (!crypto.timingSafeEqual(hmac, calcHmac))
                    return null;
                var decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
                return Buffer.concat([
                    decipher.update(ciphertext),
                    decipher.final(),
                ]).toString('utf8');
            }
            catch (_a) {
                return null;
            }
        };
        return EncryptionService_1;
    }());
    __setFunctionName(_classThis, "EncryptionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EncryptionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EncryptionService = _classThis;
}();
exports.EncryptionService = EncryptionService;
