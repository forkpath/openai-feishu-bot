// @CreateTime: 2023/3/3
// @Author: key7men
// @Contact: key7men@gmail.com
// @Last Modified By: key7men
// @Last Modified Time: 09:27
// @Description: 处理请求，并分析请求目的，交由不同的service处理
// @Link: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive

const catchAsync = require('../util/catch-async');
const db = require('../models');
const {reply, getAIAnswer, getUserInfo} = require('../services/msg.srv');
const userDao = db.user;
const questionDao = db.question;

const asyncAnswer = catchAsync(async (req, res) => {

    /**
     * param即是飞书事件消息内容
     * 内容格式如下：
     * {
     *     schema: string,
     *     header: {
     *         event_id: string
     *         token: string
     *         create_time: number
     *         event_type: string
     *         tenant_key: string
     *         app_id: string
     *     },
     *     event: {
     *         message: {
     *            chat_id: string
     *            chat_type: string
     *            content: string
     *            create_time: string
     *            message_id: string
     *            message_type: string
     *         },
     *         sender: {
     *             sender_id: {
     *                 open_id: string,
     *                 union_id: string,
     *                 user_id: string
     *             },
     *             sender_type: string,
     *             tenant_key: string
     *         }
     *     }
     * }
     */
    const param = req.body;
    // -------------------------------- 飞书服务地址校验 ------------------------------
    if (param.type && param.type === 'url_verification') {
        const challenge = req.body.challenge;
        return res.status(200).json({
            challenge
        });
    }

    // 事件标识符，同一个事件，只处理一次
    const eventId = param.header.event_id;
    // 用户id
    const userId = param.event.sender.sender_id.open_id;
    // 消息ID，通过这个ID能够准确将消息返回给问题提出者
    const msgId = param.event.message.message_id;
    // 消息类型
    const msgType = param.event.message.message_type;
    // 消息内容
    const content = param.event.message.content;

    // -------------------------------- 消息处理 ------------------------------

    // step 1: 检查该事件是否已经处理过
    let questionRecord = await questionDao.findByPk(eventId);
    if (questionRecord === null) {
        // 没有该事件的记录，就插入该事件，稍后回答完之后，再更新该事件的记录
        questionRecord = await questionDao.create({
            id: eventId,
            question_content: JSON.parse(content).text
        })
    } else {
        // 已经处理过了，直接返回
        return res.status(200);
    }

    // step 2: 检查该用户的配额是否已经用完
    let currentUser = await userDao.findByPk(userId);
    if (currentUser === null) {
        // 没有该用户的记录，说明是第一次使用，查一下名字, userInfo.data.user.name
        const userInfo = await getUserInfo(userId);
        currentUser = await userDao.create({
            id: userId,
            name: userInfo.data.user.name
        })
    } else {
        // 有用户记录的话，看看用户是否有配额，没有，直接返回消息，告知充值
        if (currentUser.consumed >= currentUser.free + currentUser.total) {
            return await reply('zero-quota', msgId, currentUser.name);
        }
    }

    // step 3: 检查消息格式是否允许，并给出对应的响应方式
    if (msgType === 'text') {

        // 明确是text类型的消息，则可以提取问题，并通过OPENAI机器人回答
        const question = JSON.parse(content).text;
        const [answer, cost] = await getAIAnswer(question, 'text');

        // 更新问题表
        questionRecord.set({
            user_id: userId,
            answer_content: answer,
            cost: cost
        });
        await questionRecord.save();

        // 更新用户配额信息
        currentUser.set({
            consumed: currentUser.consumed + 1
        });
        await currentUser.save();

        const title = `${currentUser.name}:${question}`;
        // openai返回的是类似于markdown的内容，利用飞书解析markdown的能力，将其转换为富文本
        return await reply('just-answer', msgId, title, answer);

    } else if (msgType === 'post') {
        // TODO: 后续可以通过解析（post）富文本类型的消息实现针对图片的处理
    } else {
        return await reply(msgId, '抱歉，目前您只能通过文本消息的方式，向我提问。（🌍May Be Force With You🌍）')
    }
})

module.exports = {
    asyncAnswer: asyncAnswer,
}
