import * as esprima from 'esprima';

export let typeEnum = {whileCondition:0,condition:1,computation:2,merge:3,returnType:6};
let evalCode =  [];
let inputVector = [];
let originalCode;
let currentColor = true;

let counter=1;

/*
code:
color:
nextBranch:
trueBranch:
falseBranch:
num:??
type: (condition, computation ,merge, end)
 */

function insertToEvalCode(varName,newCode) {
    if (currentColor) {
        if (varName !== undefined) {
            evalCode = evalCode.filter(x => {
                let regex = new RegExp('\\s*let\\s*' + varName + '\\s*=', 'i');
                return x.search(regex) === -1;
            });
        }
        evalCode.push(newCode);
    }
}

function getLastInTree(treeNode) {
    let next = (treeNode.type === typeEnum.whileCondition) ? treeNode.falseBranch : treeNode.trueBranch;
    if (next === undefined)
        return treeNode;
    else
        return getLastInTree (next);
}

function addToLastNode (toAdd,tree) {
    if (Object.keys(tree).length === 0 )
        return toAdd;
    else{
        let lastNode = getLastInTree(tree);
        lastNode.trueBranch = toAdd;
        return tree;
    }

}

export function createFlowChartInfo (code,input){
    //reset
    evalCode =  [];
    inputVector = [];
    originalCode = '';
    currentColor = true;
    counter =1;

    let codeTree = esprima.parse(code,{loc:true,range:true});
    inputVector = input;
    originalCode = code;
    let flowChartTree = codeTree.body.reduce((acc,curr)=>nodeTraverse(curr,acc),{});

    return flowChartTree;
}

function handleComputation(node,tree) {
    if (node.type==='VariableDeclaration')
        insertToEvalCode(node.declarations[0].id.name,originalCode.substring(node.range[0],node.range[1]));
    else
        insertToEvalCode(undefined,originalCode.substring(node.range[0],node.range[1]));
    let lastNode = getLastInTree(tree);
    if (lastNode !== undefined && lastNode.type === typeEnum.computation){
        lastNode.code = lastNode.code +' \n '+ originalCode.substring(node.range[0],node.range[1]);
        return tree;
    }
    let newNode = {
        code: originalCode.substring(node.range[0],node.range[1]),
        color:currentColor,
        trueBranch: undefined, falseBranch:undefined,
        num:counter,
        type:typeEnum.computation
    };
    counter++;
    return addToLastNode(newNode,tree);
}

function setColor(test) {
    let codeToEval = evalCode.join(';\n')+';\n'+test;
    return  eval(codeToEval);
}

function handleIf(ifNode,tree) {
    let newIfBranch = {code:  originalCode.substring(ifNode.test.range[0],ifNode.test.range[1]), color:currentColor, trueBranch: undefined, falseBranch:undefined, num:counter, type:typeEnum.condition};
    counter++;
    let newMergePoint = {type:typeEnum.merge, num: counter,color:currentColor};    counter++;
    let ditColor = setColor(originalCode.substring(ifNode.test.range[0],ifNode.test.range[1]));      currentColor = ditColor;
    let newTrueBranch = nodeTraverse(ifNode.consequent,{});
    getLastInTree(newTrueBranch).trueBranch= newMergePoint;
    let elseNode;
    if (ifNode.alternate=== null )
        elseNode = newMergePoint;
    else{
        currentColor = !ditColor;
        elseNode = nodeTraverse(ifNode.alternate,{});
        getLastInTree(elseNode).trueBranch= newMergePoint;
    }
    newIfBranch.trueBranch = newTrueBranch;
    newIfBranch.falseBranch = elseNode;
    currentColor = true;
    return addToLastNode(newIfBranch,tree);
}

function handleWhile(whileNode,tree) {
    let conditionBranch = { code:  originalCode.substring(whileNode.test.range[0],whileNode.test.range[1]),
        color:currentColor, trueBranch: undefined, falseBranch:undefined, num:counter, type:typeEnum.whileCondition};
    //create 2 merge points
    counter++;
    let firstMergePoint = {type:typeEnum.merge,num:counter,trueBranch: conditionBranch,color:currentColor};
    counter++;
    let finalMergePoint = {type:typeEnum.merge,num:counter,color:currentColor};
    counter ++;
    currentColor = setColor(originalCode.substring(whileNode.test.range[0],whileNode.test.range[1]));
    let bodyBranch = nodeTraverse(whileNode.body,{});
    conditionBranch.trueBranch = bodyBranch;
    conditionBranch.falseBranch = finalMergePoint;
    currentColor = true;
    addToLastNode(firstMergePoint,bodyBranch); //set connection to merge point
    return addToLastNode(firstMergePoint,tree);
}

function handleFunctionDeclaration(funcDecNode,tree) {
    for (let i =0;i<funcDecNode.params.length;i++)
        insertToEvalCode(funcDecNode.params[i].name,'let '+funcDecNode.params[i].name+' = '+inputVector[i]);
    return nodeTraverse(funcDecNode.body,tree);
}

function handleReturn (retNode,tree){

    let returnBranch = {
        code: originalCode.substring(retNode.range[0],retNode.range[1]),
        color:currentColor,
        trueBranch: undefined, falseBranch:undefined,
        num:counter,
        type:typeEnum.returnType
    };
    counter++;
    return addToLastNode(returnBranch,tree);
}

function nodeTraverse(node,tree) {
    let typeHandlers = [];
    typeHandlers['IfStatement'] = handleIf;
    typeHandlers['WhileStatement'] = handleWhile;
    typeHandlers['FunctionDeclaration'] = handleFunctionDeclaration;
    typeHandlers['ExpressionStatement'] = (node,tree)=>{return nodeTraverse(node.expression,tree);};
    typeHandlers['BlockStatement'] = (node,tree) =>{return node.body.reduce((acc,curr)=> nodeTraverse(curr,acc),tree);};
    typeHandlers['VariableDeclaration'] = handleComputation;
    typeHandlers['AssignmentExpression'] = handleComputation;
    typeHandlers['UpdateExpression'] = handleComputation;
    typeHandlers['ReturnStatement'] = handleReturn;

    let action = typeHandlers[node.type];


    return action(node,tree);
}

