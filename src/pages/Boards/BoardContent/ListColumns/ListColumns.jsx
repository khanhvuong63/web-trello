import Box from '@mui/material/Box'
import Column from './Column/Column'
import { Button } from '@mui/material'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { toast } from 'react-toastify'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

function ListColumns({ columns, createNewColumn, createNewCard }) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please entern column title')
      return
    }
    // tạo dữ liệu để gọi api
    const newColumnData = {
      title: newColumnTitle
    }
    //cmt video 68
    await createNewColumn(newColumnData)

    // dong trang thai them column moi & clear input
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }
  // SortableContent yêu cầu items là một mảng dạng ['id-1','id-2'] chứ ko phải [{id:'id-1'},{id:'id-2'}]
  // Nếu ko đúng thì vẫn kéo thả dc nhưng ko có animation
  // https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor:'inherit', // kế thừa từ box cha ở trên
        width:'100%',
        height:'100%',
        display:'flex',
        overflowX:'auto',
        overflowY:'hidden',
        '&::-webkit-scrollbar-track':{ m:2 }
      }}>
        {columns?.map(column => <Column key={column._id} column={column} createNewCard={createNewCard}/>)}
        {/* Box add new column CTA */}
        {!openNewColumnForm
          ? <Box onClick={toggleOpenNewColumnForm} sx={{
            minWidth:'200px',
            maxWidth:'200px',
            mx: 2,
            borderRadius:'6px',
            height:'fit-content',
            bgcolor:'#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color:'white',
                width:'100%',
                justifyContent:'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
                Add new column
            </Button>
          </Box>
          : <Box sx={{
            minWidth: '250px',
            maxWidth:'250px',
            mx:2,
            p:1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor:'#ffffff3d',
            display:'flex',
            flexDirection:'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              type="text"
              size='small'
              variant ="outlined"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx=
                {{
                  '& label':{ color:'white' },
                  '& input':{ color:'white' },
                  '& label.Mui-focused': { color:'white' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset':{
                      borderColor:'white'
                    },
                    '&:hover fieldset':{
                      borderColor:'white'
                    },
                    '&.Mui-focused fieldset':{
                      borderColor:'white'
                    }
                  }
                }}
            />
            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
              <Button
                onClick={addNewColumn}
                variant='contained'
                color='success'
                size='small'
                sx={{
                  boxShadow:'none',
                  border: '0.5px solid',
                  borderColor:(theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                }}
              >Add column</Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color:'white',
                  cursor:'pointer',
                  '&:hover':{ color: (theme) => theme.palette.warning.light }
                }}
                onClick={toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns