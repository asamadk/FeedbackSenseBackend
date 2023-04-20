export const cleanSurveyFlowJSON = (surveyJSON: string) : string => {
    if(surveyJSON == null || surveyJSON.length < 1){
        return surveyJSON;
    }
    const suveyFlowData = JSON.parse(surveyJSON);
    const surveyComponentIds = new Set<string>();
    suveyFlowData?.nodes?.forEach((node : any ) => {
        surveyComponentIds.add(node.id);
    });
    const newFlowEdges = [];
    const currentEdges : any[] = suveyFlowData?.edges;
    currentEdges.forEach(edge => {
        if(surveyComponentIds.has(edge.source) || surveyComponentIds.has(edge.target)){
            newFlowEdges.push(edge);
        }
    });
    suveyFlowData.edges = newFlowEdges;
    return JSON.stringify(suveyFlowData);
}

const populateNodeIdVsNodeMap = (nodes : any[]) : Map<string,any> => {
    const nodeIdVsNodeMap = new Map<string,any>();
    nodes.forEach(node => {
        nodeIdVsNodeMap.set(node.id,node);
    })
    return nodeIdVsNodeMap;
}


export const sortSurveyFlowNodes = (nodes : any[] , edges: any[]) : any[] => {
    // Create a set to keep track of unique node IDs
    const uniqueNodeIds = new Set<string>();
    const nodeIdVsNodeMap = populateNodeIdVsNodeMap(nodes);
    const newNodes = [];
  
    // Iterate through the edges
    for (const edge of edges) {
      // Add the source and target nodes to the set
      uniqueNodeIds.add(edge.source);
      uniqueNodeIds.add(edge.target);
    }
  
    // Convert the set of unique node IDs to an array of nodes
    for (const nodeId of uniqueNodeIds) {
        newNodes.push(
            nodeIdVsNodeMap.get(nodeId)
        );
    }
  
    // Find the first node based on the edge array
    const firstNode = newNodes.find(newNodes => newNodes.id === edges[0]?.source);
  
    // Move the first node to the beginning of the array
    if (firstNode) {
      const index = newNodes.indexOf(firstNode);
      if (index > 0) {
        newNodes.splice(index, 1);
        newNodes.unshift(firstNode);
      }
    }
  
    return newNodes;
}

