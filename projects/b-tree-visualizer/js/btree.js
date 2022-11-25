class BTree{
    constructor(order){
        this.order = order; // the size of the tree-blocks
        this.root = null;
    }
    
    search(node,value){ // search for a value in the tree
        if(node.values.includes(value)) return node; // if the value is in the node, return the node

        if(node.isLeaf) return null; // if the node is a leaf, return null
        
        let child = 0; // find the child to search
        while(child < node.length() && parseInt(value) > node.values[child]) child++;
        return this.search(node.children[child], value); // search the child
    }

    delete(value){ // delete a value from the tree
    }

    deleteAtNode(value, node){ // delete a value from a node
    }

    transfer(source,target){ // transfer a value from one node to another
    }

    merge(source,target){ // merge two nodes
    }

    insert(value){ // insert a value into the tree
        if(!this.root){ // if the tree is empty, create a new root
            this.root = new Block(true,true);
            this.root.tree = this;
        }
        const block = this.root;
        if(block.length() === 2 * this.order - 1){ // if the root is full, split it
            const tmpBlock = new Block(false); // create a new root
            tmpBlock.tree = this;
            this.root = tmpBlock;
            tmpBlock.appendChild(block, 0); // make the old root a child of the new root
            this.split(block, tmpBlock, 1); // split the old root
            this.insertAtNode(parseInt(value), tmpBlock); // insert the value into the new root
        } else {
            this.insertAtNode(parseInt(value), block); // insert the value into the root
        }
    }

    insertAtNode(value, node){ // insert a value into a node
        if(node.isLeaf && node.length() !== 2 * this.order - 1){ // if the node is a leaf, insert the value
            node.insert(value);
            return;
        }
        let tmp = node.length(); // find the child to insert the value into
        while(tmp >= 1 && value < node.values[tmp-1]) tmp--;
        if(node.children[tmp].length() === 2 * this.order - 1){ // if the child is full, split it
            this.split(node.children[tmp], node, tmp+1);
            if(value > node.values[tmp]) tmp++;
        }
        this.insertAtNode(value, node.children[tmp]); // insert the value into the child
    }

    split(child,parent,pos){ // split a node
        const newChild = new Block(child.isLeaf); // create a new node
        newChild.tree = this.root.tree; // set the tree of the new node
        // move the values and children to the new node
        for(let k = 1; k < this.order; k++){
            newChild.insert(child.remove(this.order));
        }
        // move the children to the new node
        if(!child.isLeaf){
            for(let k = 1; k <= this.order; k++){
                newChild.appendChild(child.removeChild(this.order), k-1);
            }
        }
        // insert the new node into the parent
        parent.appendChild(newChild, pos);
        // insert the middle value into the parent
        parent.insert(child.remove(this.order - 1));
        // set the leaf status of the parent to false
        parent.leaf = false;
    }
}