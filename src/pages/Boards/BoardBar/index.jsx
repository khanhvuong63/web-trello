import { Box } from '@mui/material'

function BoardBar() {
  return (
    <Box sx={{
      backgroundColor:'primary.dark',
      width:'100%',
      height:(theme) => theme.trello.boardBarHeight,
      display:'flex',
      alignItems:'center'
    }}> 
      <h1> Board bar </h1>
    </Box>
  )
}

export default BoardBar
