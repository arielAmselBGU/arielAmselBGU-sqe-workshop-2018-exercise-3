import $ from 'jquery';
import {createFlowChartInfo} from './FlowChart';
import {typeEnum} from './FlowChart';
import * as flowchart from 'flowchart.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVectorString = $('#inputVectorPlaceholder').val();
        let inputVectorArray = (inputVectorString.split('[')).map(x=>{ if (x.charAt(x.length-1) === ','){ return x.substring(0,x.length-1);} else {return x;}  }).map(x=>{if (x.indexOf(']') === -1 ) {return x.split(',');} else {return'['+x;} }).reduce((acc,curr)=>{return acc.concat(curr);},[]);

        let tree = createFlowChartInfo(codeToParse,inputVectorArray);
        let diagramCode = flowchart.parse(convertTreeToCFG (tree));
        diagramCode.drawSVG('diagram',{flowstate: {path: {fill:'#05c44d'}}});

    });
});

let nodesCreated = [];

function convertTreeToCFG(tree) {
    if (Object.keys(tree).length === 0)
        return '';
    let ansArray =  traverse(tree,'',[],'');
    let finalAns = ansArray[0]+ansArray[1].join('\n');
    return finalAns;
}

function createComputation (tree,node,con,callerName){
    let myName = 'op_'+tree.num;
    if (myName === callerName)
        return [node, con, callerName];
    if (callerName!=='')
        con.push(callerName+'->'+myName);
    if (nodesCreated.includes(myName))
        return [node, con, ''];
    let newNode = myName+'=>operation: __'+tree.num+'__\n'+tree.code+(tree.color ? '|path':'')+'\n';
    nodesCreated.push(myName);
    return traverse(tree.trueBranch,node +newNode,con,myName);
}


function createMerge (tree,node,con,callerName) {
    let myName = 'op_' + tree.num;
    if (myName === callerName)
        return [node, con, callerName];
    if (callerName!=='')
        con.push(callerName+'->'+myName);
    if (nodesCreated.includes(myName))
        return [node, con, ''];
    let newNode = myName + '=>operation: merge point'+(tree.color ? '|path':'')+'\n';
    nodesCreated.push(myName);
    return traverse(tree.trueBranch,node+ newNode,con,myName);
}

function createCondition(tree,node,con,callerName) {
    let myName = 'cond_'+tree.num;
    let condNode = '\n'+myName+'=>condition: __'+tree.num+'__\n'+tree.code+(tree.color ? '|path':'')+'\n';
    let trueCFG = traverse(tree.trueBranch,'',[],myName+'(yes)');
    let falseCFG = traverse(tree.falseBranch,'',[],myName+'(no)');
    if (callerName!=='')
        con.push(callerName+'->'+myName);
    con = con.concat(trueCFG[1]);
    con = con.concat(falseCFG[1]);
    return traverse(tree.falseBranch.trueBranch,node.toString()+condNode+trueCFG[0]+falseCFG[0],con,falseCFG[2]);
}


function split (tree,nodes,con,callerName){
    switch (tree.type) {
    case typeEnum.merge:
        return createMerge(tree,nodes,con,callerName);
    case typeEnum.condition:
        return createCondition (tree,nodes,con,callerName);
    case typeEnum.whileCondition:
        return createCondition(tree,nodes,con,callerName);
    default:
        return createComputation(tree,nodes,con,callerName);
    }
}

function traverse(tree,nodes,con,callerName){
    if (tree === undefined || tree === null || Object.keys(tree).length === 0){
        return [nodes,con,callerName];
    }
    return split (tree,nodes,con,callerName);

}


