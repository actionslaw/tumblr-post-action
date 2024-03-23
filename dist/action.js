"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostTumblrAction = void 0;
const validate_1 = require("./validate");
const tumblr_1 = require("./tumblr");
const core = __importStar(require("@actions/core"));
class PostTumblrAction {
    inputs;
    constructor(inputs) {
        this.inputs = inputs;
    }
    async run() {
        const [consumerKey, consumerSecret, accessToken, accessTokenSecret, text] = await validate_1.Validate.checkAll([
            validate_1.Validate.required('consumer-key')(this.inputs),
            validate_1.Validate.required('consumer-secret')(this.inputs),
            validate_1.Validate.required('access-token')(this.inputs),
            validate_1.Validate.required('access-token-secret')(this.inputs),
            validate_1.Validate.required('text')(this.inputs)
        ]);
        const config = {
            consumerKey,
            consumerSecret,
            accessToken,
            accessTokenSecret
        };
        const tumblr = new tumblr_1.Tumblr(config);
        core.info(`🥃 Sending post [${text}]`);
        await tumblr.post(text);
        console.log(tumblr);
    }
}
exports.PostTumblrAction = PostTumblrAction;
//# sourceMappingURL=action.js.map