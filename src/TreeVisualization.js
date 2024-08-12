import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Switch, Stack, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel } from '@mui/material';
import FigureLegend from './FigureLegend';
import SelectedNodeDetails from './SelectedNodeDetails';
import { nodeTypes, initialTreeData, renderCustomNodeElement } from './appConfig';


const TreeVisualization = () => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [newNode, setNewNode] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false);
  const [showProbabilityError, setShowProbabilityError] = useState(false);
  const [showCostError, setShowCostError] = useState(false);
  const [showUpdateExpectedCostAlert, setShowUpdateExpectedCostAlert] = useState(false);
  const treeContainerRef = useRef(null);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      });
    }
  }, []);

  const editNode = () => {
    setShowProbabilityError(false);
    setShowCostError(false);
    let returnDueToError = false;
    selectedNode.probability = parseFloat(selectedNode.probability);
    selectedNode.cost = parseFloat(selectedNode.cost);
    // Validate the probability value
    if (selectedNode.probability <= 0 || selectedNode.probability > 1) {
      setShowProbabilityError(true);
      returnDueToError = true;
    }
    // Validate the cost value
    if (selectedNode.cost < 0) {
      setShowCostError(true);
      returnDueToError = true;
    }
    if (returnDueToError) {
      return;
    }
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
    setShowEditNodeDialog(false)
  };

  const addNode = () => {
    setShowProbabilityError(false);
    setShowCostError(false);
    let returnDueToError = false;
    // Validate the probability value
    console.log('newNode:', newNode);
    newNode.probability = parseFloat(newNode.probability);
    if (newNode.probability <= 0 || newNode.probability > 1) {
      setShowProbabilityError(true);
      returnDueToError = true;
    }
    // Validate the cost value
    if (newNode.cost < 0) {
      setShowCostError(true);
      returnDueToError = true;
    }
    if (returnDueToError) {
      return;
    }
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
    setShowAddNodeDialog(false);
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
    setShowCostError(false);
    setShowProbabilityError(false);
    const nodeType = nodeDatum.nodeType;
    console.log('selected nodeType:', nodeType);
    let newNodeType = null;
    let newNodeName = null;
    let newNodeCost = null;
    let newNodeProbability = null;


    if (nodeType === nodeTypes.EXIT) {
      setNewNode({});
      return;
    }

    if (nodeType === nodeTypes.DECISION || nodeType === nodeTypes.START) {
      newNodeType = nodeTypes.ACTION;
      newNodeName = 'Untitled Action';
      newNodeCost = 0;
      newNodeProbability = 1;
    } else if (nodeType === nodeTypes.ACTION) {
      newNodeType = nodeTypes.OUTCOME;
      newNodeName = 'Untitled Outcome';
      newNodeCost = 0;
      newNodeProbability = 1;
    } else if (nodeType === nodeTypes.OUTCOME) {
      newNodeType = nodeTypes.DECISION;
      newNodeName = 'Untitled Decision';
      newNodeCost = 0;
      newNodeProbability = 1;
    }


    setNewNode({ ...newNode, nodeType: newNodeType, name: newNodeName, cost: newNodeCost, probability: newNodeProbability });
  };

  const handleAddNodeChange = (e) => {
    const { name, value } = e.target;
    setNewNode((prevNode) => ({ ...prevNode, [name]: value }));
    setShowCostError(false);
    setShowProbabilityError(false);
  };

  const handleSelectedNodeChange = (e) => {
    const { name, value } = e.target;
    setSelectedNode((prevNode) => ({ ...prevNode, [name]: value }));
    setShowCostError(false);
    setShowProbabilityError(false);
  };

  const allowEdit = (nodeDatum) => {
    return (nodeDatum.nodeType !== nodeTypes.START) && (nodeDatum.nodeType !== nodeTypes.EXIT);
  }

  const allowDelete = (nodeDatum) => {
    return (nodeDatum.nodeType !== nodeTypes.START);
  }

  const allowAdd = (nodeDatum) => {
    if (nodeDatum.nodeType === nodeTypes.EXIT) {
      return false;
    }
    return true;
  }

  const updateExpectedCost = () => {
    const updatedTree = { ...treeData };
    // calculate expected cost bottom up. 
    // The expected cost of a node is the weighted sum of the expected cost of its children plus the cost of the node.
    // The child probability should be normalized to sum to 1.
    const calculateExpectedCost = (node) => {
      // node.children is an array of children, if not empty, calculate the expected cost
      if (node.children.length > 0) {
        let totalProbability = 0;
        let totalExpectedCost = 0;

        // Calculate the total probability
        node.children.forEach((child) => {
          totalProbability += child.probability;
        });

        // Normalize the probability
        if (totalProbability !== 1) {
          node.children.forEach((child) => {
            child.probability = child.probability / totalProbability;
          });
          setShowUpdateExpectedCostAlert(true);
        }

        // Calculate the expected cost
        node.children.forEach((child) => {
          calculateExpectedCost(child);
          totalExpectedCost += child.expected_cost * child.probability;
        });

        node.expected_cost = totalExpectedCost + node.cost;
      } else {
        node.expected_cost = node.cost;
      }
    };

    // start from the root node
    calculateExpectedCost(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  }

  


  return (
    <div className="container">

      <Dialog open={showAddNodeDialog} onClose={() => { setShowAddNodeDialog(false) }}>
        <DialogTitle>Add a new Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the new node.
            newNodeType: {newNode.nodeType}
          </DialogContentText>
          {(((newNode.nodeType === nodeTypes.DECISION) || (newNode.nodeType === nodeTypes.EXIT))) && (

            <FormControlLabel control={<Switch checked={newNode.nodeType === nodeTypes.EXIT} onChange={() => { setNewNode({ ...newNode, nodeType: newNode.nodeType === nodeTypes.EXIT ? nodeTypes.DECISION : nodeTypes.EXIT }) }} />} label="Exit Node" />
          )}
          {(newNode.nodeType === nodeTypes.EXIT) && (
            <Alert severity="info">
              Add an exit node
            </Alert>
          )}
          {(newNode.nodeType === nodeTypes.DECISION) && (
            <label>
              Decision Point:
              <input type="text" name="name" onChange={(handleAddNodeChange)} />
            </label>
          )}
          {((newNode.nodeType === nodeTypes.ACTION) || (newNode.nodeType === nodeTypes.OUTCOME)) && (
            <>
              <label>
                {newNode.nodeType === nodeTypes.ACTION ? "Action Name" : "Outcome Name"}
                <input type="text" name="name" onChange={handleAddNodeChange} defaultValue={newNode.name} />
              </label>

              {newNode.nodeType === nodeTypes.ACTION && (
                <>
                  <label>Cost:<input type="number" name="cost" onChange={handleAddNodeChange} defaultValue={newNode.cost} min={0} /></label>
                  {showCostError && <Alert severity="error" > The value of cost must be greater than or equal to 0.</Alert>}
                </>
              )}

              <label>Probability:<input type="number" name="probability" onChange={handleAddNodeChange} defaultValue={newNode.probability} min={0.01} max={1} step={0.1} /></label>
              {showProbabilityError && <Alert severity="error" > The value of probability must be between 0 and 1.</Alert>}
            </>
          )}


        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowAddNodeDialog(false) }} color="error" variant="contained">Cancel</Button>
          <Button onClick={() => { addNode() }} color="primary" autoFocus variant="contained">Add Node</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteNodeDialog} onClose={() => { setShowDeleteNodeDialog(false) }}>
        <DialogTitle>Delete Selected Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected node?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowDeleteNodeDialog(false) }} color="error" variant="contained" autoFocus>Cancel</Button>
          <Button onClick={() => { deleteNode(); setShowDeleteNodeDialog(false) }} color="primary" variant="contained">Delete Node</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditNodeDialog} onClose={() => { setShowEditNodeDialog(false) }}>
        <DialogTitle>Edit Selected Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the selected node.
          </DialogContentText>
          <label> Name: <input type="text" name="name" onChange={handleSelectedNodeChange} /></label>
          {/* Default cost is 0 */}
          <label>Cost:<input type="number" name="cost" onChange={handleSelectedNodeChange} defaultValue={0} min={0} /></label>
          {showCostError && <Alert severity="error" > The value of cost must be greater than or equal to 0.</Alert>}
          {/* Default probability is 1 */}
          <label>Probability:<input type="number" name="probability" onChange={handleSelectedNodeChange} defaultValue={1} min={0.01} max={1} step={0.1} /></label>
          {showProbabilityError && <Alert severity="error" > The value of probability must be between 0 and 1.</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowEditNodeDialog(false) }} color="error" variant="contained">Cancel</Button>
          <Button onClick={() => { editNode() }} color="primary" autoFocus variant="contained">Edit Node</Button>
        </DialogActions>
      </Dialog>
        
        

      <div className="modal-panel">
      <h1>Decision Tree Visualization</h1>
        <div>
          <FigureLegend />
        </div>
        
        {showUpdateExpectedCostAlert && <Alert severity="warning" onClose={() => { setShowUpdateExpectedCostAlert(false) }}> The probability of the children of a node should sum to 1. The probabilities have been normalized.</Alert>}

        {selectedNode && (
          <>
                  <SelectedNodeDetails selectedNode={selectedNode} />


            {/* provide a nice layout of three buttons */}
            <Stack spacing={2} direction="column">

              {allowAdd(selectedNode) && <Button onClick={() => { setShowCostError(false); setShowProbabilityError(false); setShowAddNodeDialog(true) }} color='primary' variant="contained">Add Node</Button>}
              {allowDelete(selectedNode) && <Button onClick={() => { setShowCostError(false); setShowProbabilityError(false); setShowDeleteNodeDialog(true) }} color="error" variant="contained">Delete Selected Node</Button>}
              {allowEdit(selectedNode) && <Button onClick={() => { setShowCostError(false); setShowProbabilityError(false); setShowEditNodeDialog(true) }} color="success" variant="contained">Edit Selected Node</Button>}
              <Button onClick={updateExpectedCost} color="primary" variant="outlined">Update Expected Cost</Button>
            </Stack>
          </>
        )
        }
        {/* <h2>Tree Details</h2>
        <pre>{JSON.stringify(treeData, null, 2)}</pre> */}
      </div>
      <div className="tree-panel" ref={treeContainerRef}>
        <Tree data={treeData} collapsible={false} translate={translate} onNodeClick={handleNodeClick} orientation={"vertical"} renderCustomNodeElement={(rd3tProps) => renderCustomNodeElement({ ...rd3tProps, toggleNode: handleNodeClick })} />
      </div>

    </div>
  );
};

export default TreeVisualization;
