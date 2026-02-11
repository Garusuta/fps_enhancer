// src/pages/TutorialPage.tsx

import React from 'react';
import { Card } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

// 从 assets 目录导入 markdown 文件
import tutorialContent from '../assets/tutorial.md?raw';

const TutorialPage: React.FC = () => {
  // 自定义 Markdown 组件渲染
  const markdownComponents: Components = {
    code(props) {
      const { children, className, ...rest } = props;
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      if (match) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
          >
            {codeString}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code
          className={className}
          style={{
            background: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 13,
          }}
          {...rest}
        >
          {children}
        </code>
      );
    },
    img(props) {
      return (
        <img
          {...props}
          style={{ maxWidth: '100%', height: 'auto' }}
          alt={props.alt || ''}
        />
      );
    },
    table(props) {
      return (
        <table
          {...props}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 16,
          }}
        />
      );
    },
    th(props) {
      return (
        <th
          {...props}
          style={{
            border: '1px solid #d9d9d9',
            padding: '8px 12px',
            background: '#fafafa',
            textAlign: 'left',
          }}
        />
      );
    },
    td(props) {
      return (
        <td
          {...props}
          style={{
            border: '1px solid #d9d9d9',
            padding: '8px 12px',
          }}
        />
      );
    },
  };

  return (
    <Card
      style={{ height: '100%', overflow: 'auto' }}
      styles={{ body: { overflow: 'auto' } }}
    >
      <div
        style={{
          lineHeight: 1.8,
          fontSize: 14,
        }}
        className="markdown-body"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {tutorialContent}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default TutorialPage;