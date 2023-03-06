// @CreateTime: 2023/3/2
// @Author: key7men
// @Contact: key7men@gmail.com
// @Last Modified By: key7men
// @Last Modified Time: 17:22
// @Description: 任何请求都需要检查讲求参数是否合法，这里定义了所有的参数校验规则

const Joi = require('joi');

const msgParam = {
    body: Joi.object().keys({
        type: Joi.string().optional(),
        challenge: Joi.string().optional(),
        token: Joi.string().optional(),
        schema: Joi.string().valid('2.0').optional(),
        header: Joi.object().keys({
            event_id: Joi.string().required(),
            token: Joi.string().required(),
            create_time: Joi.number().required(),
            event_type: Joi.string().valid('im.message.receive_v1').required(), // 仅响应消息接收事件
            tenant_key: Joi.string().required(),
            app_id: Joi.string().required()
        }).optional(),
        event: Joi.object().keys({
            message: Joi.object().keys({
                chat_id: Joi.string().required(),
                chat_type: Joi.string().required(), // p2p表示单聊
                content: Joi.string().required(), // 需要用json序列化，然后读取其中的text
                mentions: Joi.array().optional(),
                create_time: Joi.string().required(),
                message_id: Joi.string().required(), // TODO：这个字段的含义
                message_type: Joi.string().required(), // text表示文本信息
            }),
            sender: Joi.object().keys({
                sender_id: Joi.object().keys({
                    open_id: Joi.string().required(),
                    union_id: Joi.string().required(),
                    user_id: Joi.string().required()
                }), // 测测是用户的ID
                sender_type: Joi.string().optional(),
                tenant_key: Joi.string().optional()
            })
        }).optional()
    }).with('type', ['challenge', 'token'])
        .without('type', ['schema', 'header', 'event'])
        .with('schema', ['header', 'event'])
        .without('schema', ['type', 'challenge', 'token'])
};

module.exports = {
    msgParam
};
