import { Badge } from 'antd';

import React, { useEffect, useState } from 'react';
import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import { Button, Space } from 'antd';
import { CloudUploadOutlined, EllipsisOutlined, FireOutlined, PaperClipOutlined, PlusOutlined, ReadOutlined, ShareAltOutlined, SmileOutlined } from '@ant-design/icons';

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 722px;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});

const Independent = () => {
  const { styles } = useStyle();

  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationsItems, setConversationsItems] = useState([{ key: '0', label: '我的对话' }]);
  const [activeKey, setActiveKey] = useState('0');
  const [attachedFiles, setAttachedFiles] = useState([]);

  const apiUrl = 'https://open.hunyuan.tencent.com/openapi/v1/agent/chat/completions';
   const agentId = 'riHARZzq7sAa';  // 替换为你的智能体 ID
    const token = 'ae4TeTBiCIDSjebEEivMW2QikiuV5eck';  // 替换为你的 API 调用 token
    const userId = '18636502087';  // 替换为你的用户 ID
 
  const onRequest = async (message) => {

    if (!message) return;

  // 用户消息先被添加
  setMessages((prevMessages) => [
    ...prevMessages,
    { role: 'local', message: message },
  ]);
  
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Source': 'openapi',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        assistant_id: agentId,
        user_id: userId,
        stream: false,
        messages: [{
          role: 'user',
          content: [{
            type: 'text',
            text: message,
          }],
        }],
      }),
    });
  
    const data = await response.json();
    if (data && data.choices && data.choices[0].message) {
      const aiMessage = data.choices[0].message.content;
  
      // 确保只显示最新的消息，不重复
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'local', message: message },
      ]);
  
      let charIndex = 0;
      const intervalId = setInterval(() => {
        setMessages((prevMessages) => {
          // 只更新到新的字符，不重复
          const updatedMessage = aiMessage.slice(0, charIndex + 1);
          return [
            ...prevMessages.slice(0, -1), // 删除上一个AI消息
            { role: 'ai', message: updatedMessage },
          ];
        });
  
        charIndex += 1;
  
        if (charIndex >= aiMessage.length) {
          clearInterval(intervalId);
        }
      }, 100); // 每100ms更新一次字符
    }
  };
  

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  const onSubmit = (nextContent) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent('');
  };

  const onPromptsItemClick = (info) => {
    onRequest(info.data.description);
  };

  const onAddConversation = () => {
    setConversationsItems([...conversationsItems, { key: `${conversationsItems.length}`, label: `开启新对话 ${conversationsItems.length}` }]);
    setActiveKey(`${conversationsItems.length}`);
  };

  const onConversationClick = (key) => {
    setActiveKey(key);
  };

  const handleFileChange = (info) => setAttachedFiles(info.fileList);

  const items = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message,
  }));

  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon="https://picture.gptkong.com/20250302/1720936895a2f043cabbad7ce67a92d171.jpg"
        title="这里是您的智能体助教"
        description="通过充分利用AI技术，提升教学、科研和行政管理等多方面的智能化水平"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined />} />
            <Button icon={<EllipsisOutlined />} />
          </Space>
        }
      />
    </Space>
  );

  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined />}
        >
          开启新对话
        </Button>
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
      <Bubble.List
  items={items.length > 0 ? items : [{ content: placeholderNode, variant: 'borderless' }]}
  roles={{ ai: { placement: 'start' }, local: { placement: 'end' } }} // 修改为用户消息右侧，AI左侧
  className={styles.messages}
/>

        <Prompts items={[{ key: '1', description: '常见问题', icon: <FireOutlined /> }]} onItemClick={onPromptsItemClick} />
        <Sender
          value={content}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={<Badge dot={attachedFiles.length > 0}><Button type="text" icon={<PaperClipOutlined />} onClick={() => {}} /></Badge>}
          className={styles.sender}
        />
      </div>
    </div>
  );
};

export default Independent;
