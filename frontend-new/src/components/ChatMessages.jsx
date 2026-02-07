import { motion, AnimatePresence } from 'framer-motion'
import { User, Bot, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

function MessageBubble({ message, index }) {
    const [showSources, setShowSources] = useState(false)

    const getIcon = () => {
        switch (message.type) {
            case 'user':
                return <User className="w-5 h-5" />
            case 'ai':
                return <Bot className="w-5 h-5" />
            case 'error':
                return <AlertCircle className="w-5 h-5" />
            case 'system':
                return <Info className="w-5 h-5" />
            default:
                return <Bot className="w-5 h-5" />
        }
    }

    const getStyles = () => {
        switch (message.type) {
            case 'user':
                return 'bg-ocean-50 border-ocean-200'
            case 'ai':
                return 'bg-white border-gray-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'system':
                return 'bg-green-50 border-green-200'
            default:
                return 'bg-white border-gray-200'
        }
    }

    const getIconBg = () => {
        switch (message.type) {
            case 'user':
                return 'bg-ocean-600'
            case 'ai':
                return 'bg-ocean-500'
            case 'error':
                return 'bg-red-500'
            case 'system':
                return 'bg-green-500'
            default:
                return 'bg-ocean-500'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getStyles()}`}
        >
            <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg ${getIconBg()} flex items-center justify-center text-white flex-shrink-0`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 capitalize">{message.type}</span>
                        <span className="text-xs text-gray-500">
                            {message.timestamp?.toLocaleTimeString()}
                        </span>
                    </div>

                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <p className="text-gray-700 mb-2" {...props} />,
                                code: ({ node, inline, ...props }) =>
                                    inline
                                        ? <code className="bg-ocean-100 px-2 py-0.5 rounded text-ocean-800 text-sm" {...props} />
                                        : <code className="block bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm" {...props} />,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>

                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <button
                                onClick={() => setShowSources(!showSources)}
                                className="flex items-center gap-2 text-sm font-medium text-ocean-600 hover:text-ocean-700"
                            >
                                <span>{message.sources.length} Sources</span>
                                {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {showSources && (
                                <div className="mt-2 space-y-2">
                                    {message.sources.map((source, idx) => (
                                        <div key={idx} className="bg-white rounded p-3 text-sm border border-gray-200">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-ocean-600">Source {idx + 1}</span>
                                                <span className="text-xs bg-ocean-100 text-ocean-700 px-2 py-0.5 rounded">
                                                    {(source.score * 100).toFixed(0)}% match
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-xs line-clamp-2">{source.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default function ChatMessages({ messages, isLoading }) {
    return (
        <div className="space-y-4">
            <AnimatePresence mode="popLayout">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64 text-center"
                    >
                        <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-ocean-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Ready to Chat!
                        </h3>
                        <p className="text-gray-500 max-w-md">
                            Upload a document and ask me anything about it. I'll provide detailed answers with source citations.
                        </p>
                    </motion.div>
                ) : (
                    messages.map((message, index) => (
                        <MessageBubble key={index} message={message} index={index} />
                    ))
                )}
            </AnimatePresence>

            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-ocean-600"
                >
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-ocean-600 rounded-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-sm">AI is thinking...</span>
                </motion.div>
            )}
        </div>
    )
}
