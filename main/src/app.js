"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var callback_api_1 = __importDefault(require("amqplib/callback_api"));
var axios_1 = __importDefault(require("axios"));
var typeorm_1 = require("typeorm");
var ormconfig_1 = __importDefault(require("./ormconfig"));
var product_1 = require("./entity/product");
var AppDataSource = new typeorm_1.DataSource(ormconfig_1.default);
AppDataSource.initialize().then(function (db) {
    var productRepository = db.getMongoRepository(product_1.Product);
    callback_api_1.default.connect(process.env.RABBIT_MQ_URL, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            channel.assertQueue("product_created", { durable: false });
            channel.assertQueue("product_updated", { durable: false });
            channel.assertQueue("product_deleted", { durable: false });
            var app = (0, express_1.default)();
            app.use((0, cors_1.default)());
            app.use(express_1.default.json());
            channel.consume("product_created", function (message) { return __awaiter(void 0, void 0, void 0, function () {
                var eventProduct, product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventProduct = JSON.parse(message.content.toString());
                            product = new product_1.Product();
                            product.admin_id = parseInt(eventProduct.id);
                            product.title = eventProduct.title;
                            product.image = eventProduct.image;
                            product.likes = eventProduct.likes;
                            return [4 /*yield*/, productRepository.save(product)];
                        case 1:
                            _a.sent();
                            console.log("Product created");
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            channel.consume("product_updated", function (message) { return __awaiter(void 0, void 0, void 0, function () {
                var eventProduct, product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventProduct = JSON.parse(message.content.toString());
                            return [4 /*yield*/, productRepository.findOneBy({ admin_id: parseInt(eventProduct.id) })];
                        case 1:
                            product = _a.sent();
                            productRepository.merge(product, { title: eventProduct.title, image: eventProduct.image, likes: eventProduct.likes });
                            return [4 /*yield*/, productRepository.save(product)];
                        case 2:
                            _a.sent();
                            console.log("product updated");
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            channel.consume("product_deleted", function (message) { return __awaiter(void 0, void 0, void 0, function () {
                var admin_id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            admin_id = parseInt(message.content.toString());
                            return [4 /*yield*/, productRepository.deleteOne({ admin_id: admin_id })];
                        case 1:
                            _a.sent();
                            console.log("product deleted");
                            return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, productRepository.find()];
                        case 1:
                            products = _a.sent();
                            return [2 /*return*/, res.send(products)];
                    }
                });
            }); });
            app.post("/api/products/:id/like", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, productRepository.findOne(req.params.id)];
                        case 1:
                            product = _a.sent();
                            console.log(product);
                            return [4 /*yield*/, axios_1.default.post("http://localhost:5000/api/products/".concat(product.admin_id, "/like"), {})];
                        case 2:
                            _a.sent();
                            product.likes++;
                            return [4 /*yield*/, productRepository.save(product)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, res.send(product)];
                    }
                });
            }); });
            app.listen(5001, function () {
                console.log("Listening on port 5001");
            });
            process.on("beforeExit", function () {
                console.log("Closing connection");
                connection.close();
            });
        });
    });
});
