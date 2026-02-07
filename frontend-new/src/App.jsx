import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, BarChart3, Upload, Send, Sparkles } from 'lucide-react'
import FileUploader from './components/FileUploader'
import ChatMessages from './components/ChatMessages'
import './index.css'

function App() {
  const [messages, setMessages] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (file) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setUploadedFile({ name: file.name, ...data })
      setMessages([{
        type: 'system',
        content: `✅ Document "${file.name}" uploaded successfully! ${data.chunks_created} chunks created.`,
        timestamp: new Date()
      }])
    } catch (error) {
      setMessages([{
        type: 'error',
        content: `❌ Failed to upload: ${error.message}`,
        timestamp: new Date()
      }])
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const question = input.trim()
    setInput('')

    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, top_k: 3 })
      })
      const data = await response.json()

      setMessages(prev => [...prev, {
        type: 'ai',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date()
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-gradient rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ocean-600">CELLA_AI_2.0</h1>
                <p className="text-sm text-gray-500">Document Intelligence Assistant</p>
              </div>
            </div>
            {uploadedFile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-ocean-50 rounded-lg border border-ocean-200">
                <FileText className="w-4 h-4 text-ocean-600" />
                <span className="text-sm font-medium text-ocean-700">{uploadedFile.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-ocean-600" />
                <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
              </div>
              <FileUploader onUpload={handleFileUpload} isUploading={isUploading} />
            </motion.div>

            {/* Stats Card */}
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card bg-blue-gradient text-white"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Document Stats</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Chunks Created</span>
                    <span className="text-2xl font-bold">{uploadedFile.chunks_created || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Vectors Stored</span>
                    <span className="text-2xl font-bold">{uploadedFile.vectors_stored || 0}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 card flex flex-col h-[calc(100vh-220px)]"
          >
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <MessageSquare className="w-5 h-5 text-ocean-600" />
              <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4">
              <ChatMessages messages={messages} isLoading={isLoading} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-100 pt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your document..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default App
