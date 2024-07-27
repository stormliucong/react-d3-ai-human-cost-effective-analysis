import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { v4 as uuidv4 } from 'uuid';
import {Alert, Switch, Stack, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel} from '@mui/material';

const nodeTypes = {
  START: 'start', // start is a special decision node can not be deleted.
  DECISION: 'decision', // decision node can have parent of one outcome or null, and children of one or more actions.
  ACTION: 'action', // action node can have parent of one decision, and children of one or more outcomes.
  OUTCOME: 'outcome', // outcome node can have parent of one action, and children of one decision.
  EXIT: 'exit', // exit is a special outcome node can not have children.
};

const nodeColors = {
  START: 'lightblue',
  DECISION: 'lightgreen',
  ACTION: 'lightyellow',
  OUTCOME: 'lightcoral',
  EXIT: 'lightgray',
}

const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => {
  let color;
  switch (nodeDatum.nodeType) {
    case nodeTypes.START:
      color = nodeColors.START;
      break;
    case nodeTypes.DECISION:
      color = nodeColors.DECISION;
      break;
    case nodeTypes.ACTION:
      color = nodeColors.ACTION;
      break;
    case nodeTypes.OUTCOME:
      color = nodeColors.OUTCOME;
      break;
    default:
      color = nodeColors.EXIT;
  }

  return (
    <g>
      <circle fill={color} r="20" onClick={() => toggleNode(nodeDatum)}/>
        <text fill="black" strokeWidth="1" x="30">
                    {nodeDatum.name}
        </text>
    </g>
  );
};

const initialTreeData = {
  id: uuidv4(), // Unique identifier for the node
  name: 'Start',
  nodeType: nodeTypes.START,
  probability: 1,
  cost: 0,
  children: [
    {
      id: uuidv4(),
      name: 'Action 1',
      nodeType: nodeTypes.ACTION,
      probability: 0.5,
      cost: 0,
      children: []
    },
    {
      id: uuidv4(),
      name: 'Action 2',
      nodeType: nodeTypes.ACTION,
      probability: 0.5,
      cost: 100,
      children: []
    }
  ],
};

const TreeVisualization = () => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [newNode, setNewNode] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false); 
  const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false);
  const treeContainerRef = useRef(null);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      });
    }
  }, [treeContainerRef.current]);

  const editNode = () => {
    const updatedTree = { ...treeData };
    console.log('updatedTree:', updatedTree);
    console.log('selectedNode:', selectedNode);
    const { ...nodeDetails } = selectedNode;
    console.log('Edit nodeDetails:', nodeDetails);
    console.log('selectedNode:', selectedNode);
    const editNodeRecursive = (node) => {
      if (node.id === selectedNode.id) {
        node.name = nodeDetails.name;
        node.cost = nodeDetails.cost;
        node.probability = nodeDetails.probability;
      } else if (node.children) {
        node.children.forEach(editNodeRecursive);
      }
    };
    editNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const addNode = () => {
    const updatedTree = { ...treeData };
    console.log('updatedTree:', updatedTree); 
    const { ...nodeDetails } = newNode;
    if (newNode.nodeType === nodeTypes.EXIT) {
      nodeDetails.name = 'Exit';
    }
    nodeDetails.name = nodeDetails.name || 'New Node';
    nodeDetails.cost = nodeDetails.cost || 0;
    nodeDetails.probability = nodeDetails.probability || 0;
    nodeDetails.id = uuidv4();
    nodeDetails.children = []
    console.log('Add nodeDetails:', nodeDetails);
    console.log('selectedNode:', selectedNode);
    
    // insert node into the selectedNode in the tree
    const addNodeRecursive = (node) => {
      if (node.id === selectedNode.id) {
        node.children.push(nodeDetails);
      } else if (node.children) {
        node.children.forEach(addNodeRecursive);
      }
    };

    addNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const deleteNode = () => {
    // Can't delete start node
    if (selectedNode.nodeType === nodeTypes.START) {
      alert('Cannot delete start node');
      return;
    }
    const updatedTree = { ...treeData };
    
    const deleteNodeRecursive = (node) => {
      if (node.children) {
        node.children = node.children.filter((child) => child.id !== selectedNode.id);
        node.children.forEach(deleteNodeRecursive);
      }
    };
   
    deleteNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const handleNodeClick = (nodeDatum) => {
    console.log('Node clicked:', nodeDatum);
    setSelectedNode(nodeDatum);

    const nodeType = nodeDatum.nodeType;
    console.log('selected nodeType:', nodeType);
    let newNodeType = null;

    if (nodeType === nodeTypes.EXIT) {
      return;
    }

    if (nodeType === nodeTypes.DECISION || nodeType === nodeTypes.START) {
      newNodeType = nodeTypes.ACTION;
    } else if (nodeType === nodeTypes.ACTION) {
      newNodeType = nodeTypes.OUTCOME;
    } else if (nodeType === nodeTypes.OUTCOME  ) {
      newNodeType = nodeTypes.DECISION;
    } 

    if (newNodeType) {
      setNewNode({ ...newNode, nodeType: newNodeType});
      console.log('newNode:', newNode);
    }
  };

  const handleAddNodeChange = (e) => {
    const { name, value } = e.target;
    setNewNode((prevNode) => ({ ...prevNode, [name]: value }));
  };

  const handleSelectedNodeChange = (e) => {
    const { name, value } = e.target;
    setSelectedNode((prevNode) => ({ ...prevNode, [name]: value }));
  };

  const allowEdit = (nodeDatum) => {
    return (nodeDatum.nodeType !== nodeTypes.START) && (nodeDatum.nodeType !== nodeTypes.EXIT);
  }

  const allowDelete = (nodeDatum) => { 
    return (nodeDatum.nodeType !== nodeTypes.START);
  }

  const allowAdd = (nodeDatum) => {
    if (nodeDatum.nodeType === nodeTypes.START) {
      return true
    }
    if (nodeDatum.nodeType === nodeTypes.EXIT) {
      return false;
    }
    return true;
  }



  return (
    <div className="container">

      <Dialog open={showAddNodeDialog} onClose={() => {setShowAddNodeDialog(false)}}>
        <DialogTitle>Add a new Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the new node.
          </DialogContentText>
          {((newNode.nodeType === nodeTypes.DECISION) || (newNode.nodeType === nodeTypes.EXIT))
          && (
            <>
            <FormControlLabel control={<Switch checked={newNode.nodeType === nodeTypes.EXIT} onChange={()=>{setNewNode({ ...newNode, nodeType: newNode.nodeType === nodeTypes.EXIT ? nodeTypes.DECISION : nodeTypes.EXIT })}} />} label = "Exit Node" />
            { (newNode.nodeType === nodeTypes.DECISION ) && (
              <label>
                                Decision Point:
                <input type="text" name="name" onChange={(handleAddNodeChange)} />
              </label>
            )}
            { (newNode.nodeType === nodeTypes.EXIT ) && (
              <Alert severity="info">
                  Add an exit node
              </Alert>
            )}
            </>
          )}
          
          {newNode.nodeType === nodeTypes.ACTION && (
            <>
                          <label>
                                Action Name:
                <input type="text" name="name" onChange={handleAddNodeChange} />
              </label>
              <label>
                                Cost:
                <input type="number" name="cost" onChange={handleAddNodeChange} />
              </label>
              <label>
                                Probability:
                <input type="number" name="probability" onChange={handleAddNodeChange} />
              </label>
            </>
          )}
          {newNode.nodeType === nodeTypes.OUTCOME && (
            <>
                          <label>
                                Outcome:
                <input type="text" name="name" onChange={handleAddNodeChange} />
              </label>
              <label>
                                Cost:
                <input type="number" name="cost" onChange={handleAddNodeChange} />
              </label>
              <label>
                                Probability:
                <input type="number" name="probability" onChange={handleAddNodeChange} />
              </label>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowAddNodeDialog(false)}} color="error" variant="contained">Cancel</Button>
          <Button onClick={() => {addNode(); setShowAddNodeDialog(false)}} color="primary" autoFocus variant="contained">Add Node</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteNodeDialog} onClose={() => {setShowDeleteNodeDialog(false)}}>
        <DialogTitle>Delete Selected Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected node?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowDeleteNodeDialog(false)}} color="error" variant="contained" autoFocus>Cancel</Button>
          <Button onClick={() => {deleteNode(); setShowDeleteNodeDialog(false)}} color="primary" variant="contained">Delete Node</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditNodeDialog} onClose={() => {setShowEditNodeDialog(false)}}>
        <DialogTitle>Edit Selected Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the selected node.
          </DialogContentText>
          <label> Name: <input type="text" name="name" onChange={handleSelectedNodeChange} /></label>
          <label> Cost: <input type="number" name="cost" onChange={handleSelectedNodeChange} /></label>
          <label> Probability: <input type="number" name="probability" onChange={handleSelectedNodeChange} /></label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowEditNodeDialog(false)}} color="error" variant="contained">Cancel</Button>
          <Button onClick={() => {editNode(); setShowEditNodeDialog(false)}} color="primary" autoFocus variant="contained">Edit Node</Button>
        </DialogActions>
      </Dialog>
      
      <div className="modal-panel">
      <h1>Decision Tree Visualization</h1>

        {selectedNode && (
          <>
          <h3>Selected node</h3>
          {/* <pre>{JSON.stringify(selectedNode, null)}</pre> */}
          <div>
            <p>Node Type: {selectedNode.nodeType}</p>
            <p>Name: {selectedNode.name}</p>
            <p>Cost: {selectedNode.cost}</p>
            <p>Probability: {selectedNode.probability}</p>
          </div>
        
        {/* provide a nice layout of three buttons */}
        <Stack spacing={2} direction="column">
        
        {allowAdd(selectedNode) && <Button onClick={() => {setShowAddNodeDialog(true)}} color='primary' variant="contained">Add Node</Button>}
        {allowDelete(selectedNode) && <Button onClick={() => {setShowDeleteNodeDialog(true)}} color="error" variant="contained">Delete Selected Node</Button>}
        {allowEdit(selectedNode) && <Button onClick={() => {setShowEditNodeDialog(true)}} color="primary" variant="contained">Edit Selected Node</Button>}
        </Stack>
          </>
          )
        }
        {/* <h2>Tree Details</h2>
        <pre>{JSON.stringify(treeData, null, 2)}</pre> */}
      </div>
      <div className="tree-panel" ref={treeContainerRef}>
        <Tree data={treeData} collapsible={false} translate={translate} onNodeClick={handleNodeClick} orientation={"vertical"} renderCustomNodeElement={(rd3tProps) => renderCustomNodeElement({ ...rd3tProps, toggleNode: handleNodeClick })}/>
      </div>
      
    </div>
  );
};

export default TreeVisualization;
