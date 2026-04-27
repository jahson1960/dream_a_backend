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
exports.PaymentsService = void 0;
var common_1 = require("@nestjs/common");
var https = require("https");
var crypto = require("crypto");
var PaymentsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PaymentsService = _classThis = /** @class */ (function () {
        function PaymentsService_1(dataSource, config) {
            this.dataSource = dataSource;
            this.config = config;
            this.logger = new common_1.Logger(PaymentsService.name);
            this.host = 'api.paystack.co';
            this.secret = this.config.get('PAYSTACK_SECRET_KEY') || '';
            if (!this.secret) {
                this.logger.warn('PAYSTACK_SECRET_KEY is not set');
            }
        }
        PaymentsService_1.prototype.doRequest = function (options, payload) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var req = https.request(options, function (res) {
                    var data = '';
                    res.on('data', function (chunk) { return (data += chunk); });
                    res.on('end', function () {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch (err) {
                            _this.logger.error('Failed to parse response', err);
                            reject(err);
                        }
                    });
                });
                req.on('error', function (err) { return reject(err); });
                if (payload)
                    req.write(payload);
                req.end();
            });
        };
        /* async initializeWithValidation(payload: {
          reference: string;
          email: string;
          amount: number;
          currency_code: string;
          callback_url: string;
        }) {
          
      
          // Prepare Paystack initialize payload
          const params = JSON.stringify({
            reference: payload.reference,
            email: payload.email,
            amount: String(payload.amount),
            callback_url: payload.callback_url,
            currency: payload.currency_code,
          });
      
          const options = {
            hostname: this.host,
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.secret}`,
              'Content-Type': 'application/json',
            },
          } as https.RequestOptions;
      
          const resp = await this.doRequest(options, params);
      
          // If Paystack returned success, persist initialize record
          if (resp && resp.status && resp.data && resp.data.reference) {
            try {
              await this.dataSource.query(
                `UPDATE initialized_transactions
                SET access_code = ?
                WHERE reference = ?`,
                [resp.data.access_code, resp.data.reference],
              );
            } catch (e) {
              this.logger.error('Failed inserting initialized_transactions', e as any);
              // don't fail the flow if DB insert fails - surface a 500
              throw new HttpException('Failed to record initialization', HttpStatus.INTERNAL_SERVER_ERROR);
            }
          }
      
          return resp;
        }  */
        PaymentsService_1.prototype.verifyAndPersist = function (reference) {
            return __awaiter(this, void 0, void 0, function () {
                var path, options, resp, initRows, init, d, insertSql, e_1, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            path = "/transaction/verify/".concat(encodeURIComponent(reference));
                            options = {
                                hostname: this.host,
                                port: 443,
                                path: path,
                                method: 'GET',
                                headers: {
                                    Authorization: "Bearer ".concat(this.secret),
                                },
                            };
                            return [4 /*yield*/, this.doRequest(options)];
                        case 1:
                            resp = _a.sent();
                            return [4 /*yield*/, this.dataSource.query("SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1", [reference])];
                        case 2:
                            initRows = _a.sent();
                            init = initRows && initRows.length ? initRows[0] : null;
                            if (!(resp && resp.status && resp.data && resp.data.reference)) return [3 /*break*/, 10];
                            d = resp.data;
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            insertSql = "INSERT INTO transactions (\n          id, account_number, domain, status, reference, receipt_number, amount, message, gateway_response,\n          paid_at, created_at, channel, currency, ip_address, metadata, log, authorization, customer, fees, requested_amount, transaction_date\n        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                            return [4 /*yield*/, this.dataSource.query(insertSql, [
                                    d.id,
                                    init ? init.account_number : null,
                                    d.domain || null,
                                    d.status || null,
                                    d.reference || null,
                                    d.receipt_number || null,
                                    d.amount || null,
                                    d.message || null,
                                    d.gateway_response || null,
                                    d.paid_at ? new Date(d.paid_at) : null,
                                    d.created_at ? new Date(d.created_at) : null,
                                    d.channel || null,
                                    d.currency || null,
                                    d.ip_address || null,
                                    d.metadata ? JSON.stringify(d.metadata) : null,
                                    d.log ? JSON.stringify(d.log) : null,
                                    d.authorization ? JSON.stringify(d.authorization) : null,
                                    d.customer ? JSON.stringify(d.customer) : null,
                                    d.fees || null,
                                    d.requested_amount || null,
                                    d.transaction_date ? new Date(d.transaction_date) : null,
                                ])];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            e_1 = _a.sent();
                            this.logger.error('Failed inserting transaction: ' + (e_1 && e_1.message ? e_1.message : String(e_1)));
                            if (e_1 && e_1.stack)
                                this.logger.debug(e_1.stack);
                            return [3 /*break*/, 6];
                        case 6:
                            if (!(d.status === 'success')) return [3 /*break*/, 10];
                            _a.label = 7;
                        case 7:
                            _a.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, this.dataSource.query("INSERT INTO ledger_entries (account_number, debit, credit, reference, created_at)\n             VALUES (?, ?, ?, ?, NOW())", [init ? init.account_number : null, 0.0, d.amount || 0, d.reference || null])];
                        case 8:
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            e_2 = _a.sent();
                            this.logger.error('Failed inserting ledger entry', e_2);
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/, resp];
                    }
                });
            });
        };
        PaymentsService_1.prototype.validateAndCreateReference = function (payload) {
            return __awaiter(this, void 0, void 0, function () {
                var required, _i, required_1, k, currencyRows, clientRows, client, emailHash, reference;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            required = ['username', 'account_number', 'email', 'amount', 'currency_code', 'country_code'];
                            for (_i = 0, required_1 = required; _i < required_1.length; _i++) {
                                k = required_1[_i];
                                if (!payload[k]) {
                                    throw new common_1.HttpException("".concat(k, " is required"), common_1.HttpStatus.BAD_REQUEST);
                                }
                            }
                            return [4 /*yield*/, this.dataSource.query("SELECT id FROM supported_currencies WHERE code = ?", [payload.currency_code])];
                        case 1:
                            currencyRows = _a.sent();
                            if (!currencyRows.length) {
                                throw new common_1.HttpException('Unsupported currency', common_1.HttpStatus.BAD_REQUEST);
                            }
                            return [4 /*yield*/, this.dataSource.query("SELECT username, email_hash FROM clients WHERE account_number = ?", [payload.account_number])];
                        case 2:
                            clientRows = _a.sent();
                            if (!clientRows.length) {
                                throw new common_1.HttpException('Account not found', common_1.HttpStatus.BAD_REQUEST);
                            }
                            client = clientRows[0];
                            emailHash = crypto.createHash('sha256').update(payload.email.toLowerCase()).digest('hex');
                            if (client.username !== payload.username || client.email_hash !== emailHash) {
                                throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.BAD_REQUEST);
                            }
                            reference = 'REF_' + payload.account_number + Date.now() + payload.amount + Math.floor(Math.random() * 1000);
                            // Save WITHOUT Paystack
                            return [4 /*yield*/, this.dataSource.query("INSERT INTO initialized_transactions \n      (email, account_number, amount, currency_code, reference, gateway_id, created_at)\n      VALUES (?, ?, ?, ?, ?, ?, NOW())", [
                                    payload.email,
                                    payload.account_number,
                                    payload.amount,
                                    payload.currency_code,
                                    reference,
                                    1,
                                ])];
                        case 3:
                            // Save WITHOUT Paystack
                            _a.sent();
                            return [2 /*return*/, {
                                    status: 'success',
                                    reference: reference,
                                }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.performTransaction = function (reference, callback_url) {
            return __awaiter(this, void 0, void 0, function () {
                var rows, trx, params, options, resp;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.dataSource.query("SELECT * FROM initialized_transactions WHERE reference = ? LIMIT 1", [reference])];
                        case 1:
                            rows = _b.sent();
                            if (!rows.length) {
                                throw new common_1.HttpException('Invalid reference', common_1.HttpStatus.BAD_REQUEST);
                            }
                            trx = rows[0];
                            params = JSON.stringify({
                                email: trx.email,
                                amount: String(trx.amount),
                                callback_url: callback_url,
                                currency: trx.currency_code,
                                reference: reference,
                            });
                            options = {
                                hostname: this.host,
                                port: 443,
                                path: '/transaction/initialize',
                                method: 'POST',
                                headers: {
                                    Authorization: "Bearer ".concat(this.secret),
                                    'Content-Type': 'application/json',
                                },
                            };
                            return [4 /*yield*/, this.doRequest(options, params)];
                        case 2:
                            resp = _b.sent();
                            if (!((resp === null || resp === void 0 ? void 0 : resp.status) && ((_a = resp === null || resp === void 0 ? void 0 : resp.data) === null || _a === void 0 ? void 0 : _a.authorization_url))) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.dataSource.query("UPDATE initialized_transactions SET access_code = ? WHERE reference = ?", [resp.data.access_code, reference])];
                        case 3:
                            _b.sent();
                            return [2 /*return*/, {
                                    status: true,
                                    checkout_url: resp.data.authorization_url,
                                }];
                        case 4: return [2 /*return*/, {
                                status: false,
                                message: 'Initialization failed',
                                raw: resp,
                            }];
                    }
                });
            });
        };
        return PaymentsService_1;
    }());
    __setFunctionName(_classThis, "PaymentsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsService = _classThis;
}();
exports.PaymentsService = PaymentsService;
