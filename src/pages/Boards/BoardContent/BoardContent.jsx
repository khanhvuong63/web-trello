import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

function BoardContent({ board }) {
  //https://docs.dndkit.com/api-documentation/sensors
  // nếu dùng pointerSensor mặc định thì css touch-action: none ở phần tử kéo thả nhưng còn bug
  //const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // yêu cầu trỏ chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // nhấn giữ 250ms và dung sai của cảm ứng 500px là kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm tốt trên mobile ko bị bug 
  const mySensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumnsState, setOrderedColumnsState] = useState([])

  useEffect(() => {
    setOrderedColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const handleDragEnd = (event) => {
    //console.log('handleDragEnd: ', event)
    const { active, over } = event

    //kiểm tra nếu tồn tại over (kéo linh tinh ra ngoài thì return luôn tránh phát sinh lỗi)
    if (!over) return

    // nếu vị trí kéo thả khác với vị trí ban đầu
    if (active.id !== over.id) {
      // lấy vị trí củ từ active
      const oldIndex = orderedColumnsState.findIndex(c => c._id === active.id)
      // lấy vị trí mới từ active
      const newIndex = orderedColumnsState.findIndex(c => c._id === over.id)

      // dùng arrayMove của dnd-kit để sắp xếp lại mảng Columns ban đầu
      const dndOrderedColumns = arrayMove(orderedColumnsState, oldIndex, newIndex)
      // 2 cái console.log dữ liệu này sau dùng để xử lý gọi API
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log('dndOrderedColumns ', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds ', dndOrderedColumnsIds)

      // cập nhật lại state columns ban đầu sau khi đã kéo thả
      setOrderedColumnsState(dndOrderedColumns)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={mySensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode ==='dark' ? '#34495e' : '#1976d2'),
        width:'100%',
        height: ( theme ) => theme.trello.boardContentHeight,
        p:'10px 0'
      }}>
        <ListColumns columns={orderedColumnsState} />
      </Box>
    </DndContext>
  )
}

export default BoardContent
