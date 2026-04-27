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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
var common_1 = require("@nestjs/common");
var crypto = require("crypto");
var ClientsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ClientsService = _classThis = /** @class */ (function () {
        function ClientsService_1(dataSource, config) {
            this.dataSource = dataSource;
            this.config = config;
        }
        ClientsService_1.prototype.encryptData = function (plaintext) {
            var key = this.config.get('APP_ENCRYPTION_KEY');
            var hmacKey = this.config.get('APP_HMAC_KEY');
            if (!key || !hmacKey)
                throw new common_1.HttpException('Encryption keys missing', 500);
            var iv = crypto.randomBytes(16);
            var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
            var encrypted = cipher.update(plaintext, 'utf8', 'binary');
            encrypted += cipher.final('binary');
            var hmac = crypto.createHmac('sha256', Buffer.from(hmacKey, 'hex'));
            hmac.update(Buffer.from(encrypted, 'binary'));
            var hmacDigest = hmac.digest();
            var combined = Buffer.concat([iv, hmacDigest, Buffer.from(encrypted, 'binary')]);
            return combined.toString('base64');
        };
        ClientsService_1.prototype.decryptData = function (encrypted) {
            var key = this.config.get('APP_ENCRYPTION_KEY');
            var hmacKey = this.config.get('APP_HMAC_KEY');
            if (!key || !hmacKey)
                return false;
            var data = Buffer.from(encrypted, 'base64');
            var iv = data.slice(0, 16);
            var hmac = data.slice(16, 48);
            var ciphertext = data.slice(48);
            var calculatedHmac = crypto.createHmac('sha256', Buffer.from(hmacKey, 'hex'));
            calculatedHmac.update(ciphertext);
            if (!crypto.timingSafeEqual(hmac, calculatedHmac.digest()))
                return false;
            var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
            var decrypted = decipher.update(ciphertext, undefined, 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        };
        ClientsService_1.prototype.register = function (dto, req) {
            return __awaiter(this, void 0, void 0, function () {
                var queryRunner, existingUser, emailHash, existingEmail, emailEnc, firstNameEnc, middleNameEnc, lastNameEnc, accountNumber, existingAccount, insertResult, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queryRunner = this.dataSource.createQueryRunner();
                            return [4 /*yield*/, queryRunner.connect()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, queryRunner.startTransaction()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 13, 15, 17]);
                            return [4 /*yield*/, queryRunner.query("SELECT id FROM clients WHERE username = ?", [dto.username])];
                        case 4:
                            existingUser = _a.sent();
                            if (existingUser.length)
                                throw new common_1.HttpException('Username exists', 409);
                            emailHash = crypto.createHash('sha256').update(dto.email.toLowerCase()).digest('hex');
                            return [4 /*yield*/, queryRunner.query("SELECT id FROM clients WHERE email_hash = ?", [emailHash])];
                        case 5:
                            existingEmail = _a.sent();
                            if (existingEmail.length)
                                throw new common_1.HttpException('Email exists', 409);
                            emailEnc = this.encryptData(dto.email);
                            firstNameEnc = this.encryptData(dto.first_name);
                            middleNameEnc = dto.middle_name ? this.encryptData(dto.middle_name) : null;
                            lastNameEnc = this.encryptData(dto.last_name);
                            accountNumber = void 0;
                            _a.label = 6;
                        case 6:
                            accountNumber = '88' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
                            return [4 /*yield*/, queryRunner.query("SELECT id FROM clients WHERE account_number = ?", [accountNumber])];
                        case 7:
                            existingAccount = _a.sent();
                            if (existingAccount.length === 0)
                                return [3 /*break*/, 9];
                            _a.label = 8;
                        case 8:
                            if (true) return [3 /*break*/, 6];
                            _a.label = 9;
                        case 9: return [4 /*yield*/, queryRunner.query("INSERT INTO clients\n        (username, email_enc, email_hash, first_name_enc, middle_name_enc, last_name_enc, account_number, created_at)\n        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())", [dto.username, emailEnc, emailHash, firstNameEnc, middleNameEnc, lastNameEnc, accountNumber])];
                        case 10:
                            insertResult = _a.sent();
                            // Log request
                            return [4 /*yield*/, queryRunner.query("INSERT INTO api_logs\n        (api_client_id, endpoint, request_body, response_body, status_code, ip_address)\n        VALUES (?, ?, ?, ?, ?, ?)", [
                                    1, // replace with API client ID from guard if needed
                                    'clients/register',
                                    JSON.stringify(dto),
                                    JSON.stringify({ status: 'success', account_number: accountNumber }),
                                    200,
                                    req.ip || req.connection.remoteAddress,
                                ])];
                        case 11:
                            // Log request
                            _a.sent();
                            return [4 /*yield*/, queryRunner.commitTransaction()];
                        case 12:
                            _a.sent();
                            return [2 /*return*/, {
                                    status: 'success',
                                    message: 'Registration successful',
                                    account_number: accountNumber,
                                }];
                        case 13:
                            err_1 = _a.sent();
                            return [4 /*yield*/, queryRunner.rollbackTransaction()];
                        case 14:
                            _a.sent();
                            throw err_1;
                        case 15: return [4 /*yield*/, queryRunner.release()];
                        case 16:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 17: return [2 /*return*/];
                    }
                });
            });
        };
        return ClientsService_1;
    }());
    __setFunctionName(_classThis, "ClientsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ClientsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ClientsService = _classThis;
}();
exports.ClientsService = ClientsService;
