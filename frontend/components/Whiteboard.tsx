"use client"
import { useState, useRef, useEffect } from 'react'
import {
    Square, Circle, Diamond, Type, Move,
    MousePointer2, Save, ArrowRight, Trash2,
    Undo, Redo
} from 'lucide-react'

// Shapes
export type ShapeType = 'rect' | 'circle' | 'diamond' | 'text' | 'arrow'

export interface Shape {
    id: string
    type: ShapeType
    x: number
    y: number
    width: number
    height: number
    text?: string
    color: string
}

interface WhiteboardProps {
    initialData?: Shape[]
    onSave: (data: Shape[]) => void
    readOnly?: boolean
}

export default function Whiteboard({ initialData = [], onSave, readOnly = false }: WhiteboardProps) {
    const [shapes, setShapes] = useState<Shape[]>(initialData)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [tool, setTool] = useState<ShapeType | 'select'>('select')
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null)

    // Canvas ref
    const svgRef = useRef<SVGSVGElement>(null)

    // Tools configuration
    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Select' },
        { id: 'rect', icon: Square, label: 'Process' },
        { id: 'diamond', icon: Diamond, label: 'Decision' },
        { id: 'circle', icon: Circle, label: 'Start/End' },
        { id: 'text', icon: Type, label: 'Label' },
        { id: 'arrow', icon: ArrowRight, label: 'Flow' }
    ]

    const handleMouseDown = (e: React.MouseEvent, shapeId?: string) => {
        if (readOnly) return

        if (tool === 'select') {
            if (shapeId) {
                const shape = shapes.find(s => s.id === shapeId)
                if (shape) {
                    setSelectedId(shapeId)
                    setIsDragging(true)
                    // Calculate offset relative to shape
                    const svgRect = svgRef.current?.getBoundingClientRect()
                    if (svgRect) {
                        setDragOffset({
                            x: e.clientX - svgRect.left - shape.x,
                            y: e.clientY - svgRect.top - shape.y
                        })
                    }
                }
            } else {
                setSelectedId(null)
            }
        } else {
            // Create new shape
            const svgRect = svgRef.current?.getBoundingClientRect()
            if (!svgRect) return

            const x = e.clientX - svgRect.left
            const y = e.clientY - svgRect.top

            let width = 100
            let height = 50
            if (tool === 'text') { width = 120; height = 40 }
            if (tool === 'circle') { width = 60; height = 60 }
            if (tool === 'arrow') { width = 100; height = 40 }

            const newShape: Shape = {
                id: crypto.randomUUID(),
                type: tool as ShapeType,
                x: x - width / 2,
                y: y - height / 2,
                width,
                height,
                color: tool === 'arrow' ? 'var(--text-primary)' : '#ffffff',
                text: tool === 'text' ? 'New Label' : (tool === 'diamond' ? 'Decision?' : (tool === 'arrow' ? '' : 'Step'))
            }

            setShapes([...shapes, newShape])
            setSelectedId(newShape.id)
            setTool('select') // Switch back to select after placing
            setHoverPos(null)
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        // Update ghost position
        const svgRect = svgRef.current?.getBoundingClientRect()
        if (svgRect) {
            setHoverPos({
                x: e.clientX - svgRect.left,
                y: e.clientY - svgRect.top
            })
        }

        if (!isDragging || !selectedId || readOnly) return
        if (!svgRect) return

        const x = e.clientX - svgRect.left - dragOffset.x
        const y = e.clientY - svgRect.top - dragOffset.y

        setShapes(prev => prev.map(s =>
            s.id === selectedId ? { ...s, x, y } : s
        ))
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const updateShapeText = (id: string, text: string) => {
        setShapes(prev => prev.map(s =>
            s.id === id ? { ...s, text } : s
        ))
    }

    const deleteSelected = () => {
        if (selectedId) {
            setShapes(prev => prev.filter(s => s.id !== selectedId))
            setSelectedId(null)
        }
    }

    // Keyboard support for delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    deleteSelected()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedId])

    // Auto-save logic
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (shapes !== initialData) {
                onSave(shapes)
            }
        }, 3000) // Auto-save after 3 seconds of inactivity

        return () => clearTimeout(timeoutId)
    }, [shapes, onSave])

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-tertiary)]/30 relative">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 bg-[var(--bg-primary)] p-2 rounded-lg shadow-sm border border-[var(--border-default)] z-10">
                {tools.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id as any)}
                        className={`p-2 rounded-md transition-colors ${tool === t.id
                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                            }`}
                        title={t.label}
                        disabled={readOnly}
                    >
                        <t.icon size={20} />
                    </button>
                ))}
                {!readOnly && (
                    <>
                        <div className="h-px bg-[var(--border-default)] my-1" />
                        <button
                            onClick={deleteSelected}
                            disabled={!selectedId}
                            className={`p-2 rounded-md transition-colors ${selectedId
                                ? 'text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10'
                                : 'text-[var(--text-tertiary)] cursor-not-allowed'
                                }`}
                            title="Delete Selected"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={() => onSave(shapes)}
                            className="p-2 rounded-md text-[var(--accent-green)] hover:bg-[var(--accent-green)]/10 mt-2"
                            title="Save Whiteboard"
                        >
                            <Save size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Canvas */}
            <svg
                ref={svgRef}
                className={`w-full h-full bg-[var(--pattern-dots)] ${tool !== 'select' ? 'cursor-none' : 'cursor-default'}`}
                onMouseDown={(e) => handleMouseDown(e)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { handleMouseUp(); setHoverPos(null); }}
            >
                {/* Defs */}
                <defs>
                    <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="var(--border-default)" />
                    </pattern>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-primary)" />
                    </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#dot-pattern)" pointerEvents="none" />

                {/* Render Shapes */}
                {shapes.map(shape => {
                    const isSelected = selectedId === shape.id

                    return (
                        <g
                            key={shape.id}
                            transform={`translate(${shape.x}, ${shape.y})`}
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                handleMouseDown(e, shape.id)
                            }}
                            className={`${isSelected ? 'cursor-move' : 'cursor-pointer'}`}
                        >
                            {/* Shape Rendering */}
                            {shape.type === 'rect' && (
                                <rect
                                    width={shape.width}
                                    height={shape.height}
                                    rx="4"
                                    fill={shape.color}
                                    stroke={isSelected ? 'var(--accent-blue)' : 'var(--text-primary)'}
                                    strokeWidth={isSelected ? 2 : 1.5}
                                />
                            )}
                            {shape.type === 'circle' && (
                                <circle
                                    cx={shape.width / 2}
                                    cy={shape.height / 2}
                                    r={Math.min(shape.width, shape.height) / 2}
                                    fill={shape.color}
                                    stroke={isSelected ? 'var(--accent-blue)' : 'var(--text-primary)'}
                                    strokeWidth={isSelected ? 2 : 1.5}
                                />
                            )}
                            {shape.type === 'diamond' && (
                                <polygon
                                    points={`${shape.width / 2},0 ${shape.width},${shape.height / 2} ${shape.width / 2},${shape.height} 0,${shape.height / 2}`}
                                    fill={shape.color}
                                    stroke={isSelected ? 'var(--accent-blue)' : 'var(--text-primary)'}
                                    strokeWidth={isSelected ? 2 : 1.5}
                                />
                            )}
                            {shape.type === 'arrow' && (
                                <line
                                    x1="0" y1={shape.height / 2}
                                    x2={shape.width} y2={shape.height / 2}
                                    stroke={isSelected ? 'var(--accent-blue)' : 'var(--text-primary)'}
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                />
                            )}

                            {/* Text Editing */}
                            {shape.type !== 'arrow' && (
                                selectedId === shape.id && !readOnly ? (
                                    <foreignObject x="5" y={shape.height / 2 - 12} width={shape.width - 10} height="24">
                                        <input
                                            value={shape.text || ''}
                                            onChange={(e) => updateShapeText(shape.id, e.target.value)}
                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none"
                                            style={{ color: 'black' }}
                                            autoFocus
                                        />
                                    </foreignObject>
                                ) : (
                                    <text
                                        x={shape.width / 2}
                                        y={shape.height / 2}
                                        dy=".3em"
                                        textAnchor="middle"
                                        className="text-xs font-medium pointer-events-none select-none"
                                        fill="black"
                                    >
                                        {shape.text}
                                    </text>
                                )
                            )}
                        </g>
                    )
                })}

                {/* Ghost Shape for Preview */}
                {tool !== 'select' && hoverPos && (
                    <g transform={`translate(${hoverPos.x - 50}, ${hoverPos.y - 25})`} style={{ opacity: 0.5, pointerEvents: 'none' }}>
                        {tool === 'rect' && <rect width="100" height="50" rx="4" fill="none" stroke="var(--text-secondary)" strokeDasharray="4" />}
                        {tool === 'circle' && <circle cx="30" cy="30" r="30" fill="none" stroke="var(--text-secondary)" strokeDasharray="4" />}
                        {tool === 'diamond' && <polygon points="50,0 100,25 50,50 0,25" fill="none" stroke="var(--text-secondary)" strokeDasharray="4" />}
                        {tool === 'arrow' && <line x1="0" y1="20" x2="100" y2="20" stroke="var(--text-secondary)" strokeDasharray="4" markerEnd="url(#arrowhead)" />}
                        {tool === 'text' && <text x="60" y="20" fill="var(--text-secondary)">Label</text>}
                    </g>
                )}
            </svg>

            <div className="absolute bottom-4 right-4 bg-[var(--bg-primary)] px-3 py-1 rounded-full text-xs text-[var(--text-tertiary)] border border-[var(--border-default)] shadow-sm">
                Whiteboard v1.0 • Auto-save enabled
            </div>
        </div>
    )
}
