import React, {useEffect, useRef} from 'react';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import {useTheme} from '@material-ui/core/styles';
import { gql, useQuery } from '@apollo/client';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MythicTextField from '../../MythicComponents/MythicTextField';


const getCommandsAndPayloadTypesQuery = gql`
query getCommandsAndPayloadTypes{
  payloadtype(order_by: {ptype: asc}){
    id
    ptype
    commands(order_by: {cmd: asc}){
      id
      cmd
    }
  }
}
`;

export function EditScriptDialog(props) {
    const theme = useTheme();
    const [script, setScript] = React.useState("");
    const [selectedPayloadType, setSelectedPayloadType] = React.useState('');
    const [selectedCommand, setSelectedCommand] = React.useState('');
    const [payloadTypeCmdOptions, setPayloadTypeCmdOptions] = React.useState([]);
    const [commandOptions, setCommandOptions] = React.useState([]);
    const [author, setAuthor] = React.useState('');
    const inputPTRef = useRef(null); 
    const inputCMDRef = useRef(null); 
    useQuery(getCommandsAndPayloadTypesQuery, {
      onCompleted: data => {
        setPayloadTypeCmdOptions(data.payloadtype);
        if(props.payload_type_id !== undefined){
          setSelectedPayloadType(props.payload_type_id);
        }else{
          if(data.payloadtype.length > 0){
            setSelectedPayloadType(data.payloadtype[0].id);
          }
        }
        if(props.command_id !== undefined){
          setSelectedCommand(props.command_id);
          for(let i = 0; i < data.payloadtype.length; i++){
            if(props.payload_type_id === data.payloadtype[i].id){
              setCommandOptions(data.payloadtype[i].commands)
            }
          }
        }else{
          if(data.payloadtype.length > 0){
            if(data.payloadtype[0].commands.length > 0){
              setCommandOptions(data.payloadtype[0].commands);
              setSelectedCommand(data.payloadtype[0].commands[0].id);
            }
          }
        }
        if(props.author !== undefined){
          setAuthor(props.author);
        }
      },
      onError: data => {

      }
    })
    useEffect( () => {
        if(props.script !== undefined){
          setScript(atob(props.script));
        }        
    }, [props.script]);
    const onChange = (value) => {
        setScript(value);
    }
    const onSubmit = () => {
        props.onSubmitEdit({script: btoa(script), command_id: selectedCommand, payload_type_id: selectedPayloadType, author});
        props.onClose();
    }
    const onRevert = () => {
        props.onRevert();
        props.onClose();
    }
    const onChangeSelectedPayloadType = (event) => {
      setSelectedPayloadType(event.target.value);
      const cmds = payloadTypeCmdOptions.filter( (p) => p.id === event.target.value);
      setCommandOptions(cmds[0].commands);
      setSelectedCommand(cmds[0].commands[0].id);
    }
    const onChangeSelectedCommand = (event) => {
      setSelectedCommand(event.target.value);
    }
    const onChangeAuthor = (name, value, error) => {
      setAuthor(value);
    }
  return (
    <React.Fragment>
        <DialogTitle >
          {props.title ? props.title : "Edit BrowserScript Code"}
          </DialogTitle>
        <DialogContent dividers={true} style={{height: "calc(80vh)"}}>
        <FormControl style={{width: "50%"}}>
            <InputLabel ref={inputPTRef}>Payload Type</InputLabel>
            <Select
              labelId="demo-dialog-select-label"
              id="demo-dialog-select"
              value={selectedPayloadType}
              onChange={onChangeSelectedPayloadType}
              input={<Input style={{width: "100%"}}/>}
            >
              {payloadTypeCmdOptions.map( (opt) => (
                  <MenuItem value={opt.id} key={"payloadtype" + opt.id}>{opt.ptype}</MenuItem>
              ) )}
            </Select>
          </FormControl>
          <FormControl style={{width: "50%", paddingBottom: "10px"}}>
            <InputLabel ref={inputCMDRef}>Command</InputLabel>
            <Select
              labelId="demo-dialog-select-label"
              id="demo-dialog-select"
              value={selectedCommand}
              onChange={onChangeSelectedCommand}
              input={<Input style={{width: "100%"}}/>}
            >
              {commandOptions.map( (opt) => (
                  <MenuItem value={opt.id} key={"command" + opt.id}>{opt.cmd}</MenuItem>
              ) )}
            </Select>
          </FormControl>
          <MythicTextField value={author} onChange={onChangeAuthor} name="Author" fullWidth />
           <AceEditor
                mode="javascript"
                theme={theme.palette.type === 'dark' ? 'monokai' : 'github'}
                width="100%"
                height="100%"
                value={script} 
                focus={true}
                onChange={onChange}
                setOptions={{
                
                }}
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} variant="contained" style={{backgroundColor: theme.palette.primary.main}}>
            Close
          </Button>
          {props.new ? (
            <Button onClick={onSubmit} variant="contained" style={{backgroundColor: theme.palette.warning.main}}>
              Create
          </Button>
          ) : (
            <React.Fragment>
              <Button onClick={onRevert} variant="contained" style={{backgroundColor: theme.palette.success.main}}>
                Revert
              </Button>
          
              <Button onClick={onSubmit} variant="contained" style={{backgroundColor: theme.palette.warning.main}}>
                Save
              </Button>
            </React.Fragment>
          )}
          
        </DialogActions>
  </React.Fragment>
  );
}
