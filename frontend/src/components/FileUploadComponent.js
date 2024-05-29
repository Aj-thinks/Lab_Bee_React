
import React, { useState, useRef } from 'react'
import { Button, FormControl, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';


export default function FileUploadComponent({ fieldName = 'Attach files or Documents' }) {

  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleAttachedFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(files);

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    console.log('formData', formData)

    // try {
    //   const response = await axios.post('/api/upload', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    //   console.log('Files uploaded successfully:', response.data);
    // } catch (error) {
    //   console.error('Error uploading files:', error);
    // }
  };

  const handleRemoveAttachedFile = (index) => {
    const updatedFiles = [...attachedFiles];
    updatedFiles.splice(index, 1);
    setAttachedFiles(updatedFiles);
  };

  const handleFileClick = (file) => {
    console.log('clicked', file);
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  };


  return (

    <div style={{ width: '50%' }}>
      <Typography variant='h6'>{fieldName}</Typography>
      <input
        type="file"
        multiple
        accept="image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint"
        onChange={handleAttachedFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <Button variant="contained" onClick={() => fileInputRef.current.click()}>
        Select Files
      </Button>
      <List>
        {attachedFiles.map((file, index) => (
          <ListItem key={index} ButtonBase onClick={() => handleFileClick(file)}>
            <ListItemText primary={file.name} />
            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAttachedFile(index)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

}


{/* <div style={{ width: '50%' }}>
  <Typography variant='h6'>{fieldName}</Typography>
  <input
    type="file"
    multiple
    accept="image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint"
    onChange={handleAttachedFileChange}
    ref={fileInputRef}
  />

  <List>
    {attachedFiles.map((fileName, index) => (
      <ListItem key={index}>
        <ListItemText primary={<a href="#" onClick={(e) => { e.preventDefault(); handleFileClick(fileName); }}>{fileName}</a>} />
        <IconButton onClick={() => handleRemoveAttachedFile(index)}> <ClearIcon /> </IconButton>
      </ListItem>
    ))}
  </List>

</div> */}





// <div style={{ width: '50%' }}>
//   <Typography variant='h6'> {fieldName}</Typography>
//   <FormControl>
//     <input
//       type='file'
//       multiple
//       accept="image/jpeg, image/png, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint"
//       onChange={handleAttachedFileChange}
//       ref={fileInputRef}
//     />

//     <TextField
//       fullWidth
//       value={attachedFiles.join(', ')}
//       // readOnly
//       onClick={() => fileInputRef.current.click()}  // Trigger file input click when TextField is clicked
//       variant="outlined"
//       InputProps={{
//         readOnly: true,  // Prevent editing
//       }}
//     />
//   </FormControl>

//   <div>
//     {attachedFiles.length > 0 && (
//       <List>
//         {attachedFiles.map((fileName, index) => (
//           <ListItem key={index}>
//             <ListItemText primary={<a href="#" onClick={(e) => { e.preventDefault(); window.open(fileName); }}>{fileName}</a>} />
//             <IconButton onClick={() => handleRemoveAttachedFile(index)}> <ClearIcon /> </IconButton>
//           </ListItem>
//         ))}
//       </List>
//     )}
//   </div>
// </div>
