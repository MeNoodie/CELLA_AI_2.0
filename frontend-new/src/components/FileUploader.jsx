import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileText, Loader2 } from 'lucide-react'

export default function FileUploader({ onUpload, isUploading }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles[0]) {
            onUpload(acceptedFiles[0])
        }
    }, [onUpload])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'text/csv': ['.csv']
        },
        maxFiles: 1,
        disabled: isUploading
    })

    return (
        <div>
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: isUploading ? 1 : 1.02 }}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive
                        ? 'border-ocean-500 bg-ocean-50'
                        : 'border-gray-300 hover:border-ocean-400 hover:bg-gray-50'
                    }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-3">
                    {isUploading ? (
                        <Loader2 className="w-12 h-12 text-ocean-600 animate-spin" />
                    ) : (
                        <Upload className="w-12 h-12 text-ocean-600" />
                    )}

                    <div>
                        <p className="font-medium text-gray-900 mb-1">
                            {isUploading ? 'Uploading...' : isDragActive ? 'Drop here!' : 'Drop your document'}
                        </p>
                        <p className="text-sm text-gray-500">
                            or click to browse
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {['PDF', 'DOCX', 'TXT', 'XLSX', 'CSV'].map((format) => (
                    <span
                        key={format}
                        className="px-2 py-1 text-xs font-medium bg-ocean-50 text-ocean-700 rounded"
                    >
                        {format}
                    </span>
                ))}
            </div>
        </div>
    )
}
