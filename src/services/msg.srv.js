const lark = require('@larksuiteoapi/node-sdk');
const {Configuration, OpenAIApi} = require('openai');
const logger = require('../config/logger');
const config = require('../config/config');

// 飞书请求客户端
const larkClient = new lark.Client({
    appId: config.lark.id,
    appSecret: config.lark.secret,
    disableTokenCache: false,
})

// openAI请求客户端
const configuration = new Configuration({
    // organization: config.openai.orgID,
    apiKey: config.openai.key,
})

const openAIClient = new OpenAIApi(configuration);

// 飞书回复消息, 目前有两种类型，配额耗尽通知购买 / 正常消息内容markdown模式
async function reply(type, messageId, title = '', msgContent = '') {
    try {
        if (type === 'zero-quota') {
            const pricingContent = {};
            return await larkClient.im.message.reply({
                path: {
                    message_id: messageId,
                },
                data: {
                    content: _getPricingContent(title),
                    msg_type: 'interactive',
                }
            });
        } else if (type === 'just-answer') {

            return await larkClient.im.message.reply({
                path: {
                    message_id: messageId,
                },
                data: {
                    content: _getAnswerContent(title, msgContent),
                    msg_type: 'interactive',
                }
            });
        }
    } catch (e) {
        logger.error(`send message to feishu ${messageId}: ${msgContent} with error ${e}`);
    }
}

// 飞书查询用户信息
async function getUserInfo(userId) {
    try {
        return await larkClient.contact.user.get({
            path: {
                user_id: userId,
            }
        });
    } catch (e) {
        logger.error(`get user ${userId} info error ${e}`);
    }
}

// 通过 OpenAI API SDK 获取回复
async function getAIAnswer(question, type) {
    switch (type) {
        case 'text':
            return await _genChat(question);
        case 'image_gen':
            return await _genImage(question);
        case 'image_edit':
            return await _editImage(question);
        default:
            return await _genChat(question);
    }
}


// ------------------------ FEISHU -------------------------
function _getAnswerContent(title, answer) {
    const template = {
        config: {
            'wide_screen_mode': true
        },
        header: {
            template: 'blue',
            title: {
                content: title,
                tag: 'plain_text'
            }
        },
        elements: [
            {
                tag: 'markdown',
                content: answer
            },
            {
                tag: 'hr'
            },
            {
                tag: 'note',
                elements: [
                    {
                        tag: 'img',
                        img_key: 'img_v2_57520a3b-f910-45e7-a71a-b34b033858dg',
                        alt: {
                            tag: 'plain_text',
                            content: 'key7men'
                        }
                    },
                    {
                        tag: 'plain_text',
                        content: '：以上回答来自OpenAI（您的问题描述越具体，OpenAI输出的内容将越准确。但希望你不是拿来主义）'
                    }
                ]
            }
        ]
    }
    return JSON.stringify(template);
}

function _getPricingContent(title) {
    const template = {
        header: {
            template: 'orange',
            title: {
                content: `${title}, 您的提问配额已耗尽，请参考会员定价，按需充值服务`,
                tag: 'plain_text'
            }
        },
        elements: [
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: '**普通用户**\n\n免费，每天可以向我提 **<font color=\"green\"> 1 </font>** 个问题'
                },
                extra: {
                    tag: 'img',
                    img_key: 'img_v2_3d1aaabe-7df6-46ed-9bcb-d6627804ee6g',
                    preview: false,
                    alt: {
                        tag: 'plain_text',
                        content: '普通用户'
                    }
                }
            },
            {
                tag: 'hr'
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: '**高级会员**\n\n按周付费，每周**<font color="green"> 19.9元 </font>**，每天可以向我提 **<font color="green"> 11 </font>** 个问题'
                },
                extra: {
                    tag: 'img',
                    img_key: 'img_v2_182a74c1-5a19-4937-b5da-b36b11f3e71g',
                    preview: false,
                    alt: {
                        tag: 'plain_text',
                        content: '高级会员'
                    }
                }
            },
            {
                tag: 'hr'
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: '**终极会员**\n\n按月付费，每月**<font color="green"> 49.9元 </font>**，每天可以向我提 **<font color="green"> 101 </font>** 个问题'
                },
                extra: {
                    tag: 'img',
                    img_key: 'img_v2_a3e5e41b-d864-4688-8342-f706148f6d0g',
                    preview: false,
                    alt: {
                        tag: 'plain_text',
                        content: '终极会员'
                    }
                }
            },
            {
                tag: 'hr'
            },
            {
                tag: 'column_set',
                flex_mode: 'none',
                columns: [
                    {
                        tag: 'column',
                        width: 'weighted',
                        weight: 1,
                        vertical_align: 'top',
                        elements: [
                            {
                                tag: 'img',
                                img_key: 'img_v2_b54f3d05-6d15-48e3-83b6-563846b64f2g',
                                alt: {
                                    tag: 'plain_text',
                                    content: ''
                                },
                                mode: 'fit_horizontal',
                                preview: true
                            }
                        ]
                    },
                    {
                        tag: 'column',
                        width: 'weighted',
                        weight: 1,
                        vertical_align: 'top',
                        elements: [
                            {
                                tag: 'img',
                                img_key: 'img_v2_bbb35b3e-3cf6-439a-a2be-1e4fc375caag',
                                alt: {
                                    tag: 'plain_text',
                                    content: ''
                                },
                                mode: 'fit_horizontal',
                                preview: true
                            }
                        ]
                    }
                ]
            }
        ]
    }
    return JSON.stringify(template);
}

// ------------------------ OPENAI -------------------------
// chat文档
async function _genChat(description) {
    const result = await openAIClient.createChatCompletion({
        model: config.openai.model,
        messages: [{
            role: 'user',
            content: description
        }]
    })
    return [result.data.choices[0].message.content, result.data.usage.total_tokens];
}

// TODO: image生成
async function _genImage(description) {
}

// TODO: image编辑
async function _editImage(description) {
}

module.exports = {
    reply: reply,
    getAIAnswer: getAIAnswer,
    getUserInfo: getUserInfo
}



