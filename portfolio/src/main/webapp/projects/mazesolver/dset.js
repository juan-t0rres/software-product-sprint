function dset(size){
    this.parent = new Array(size);
    this.height = new Array(size);

    for(var i = 0; i < size; i++){
        this.parent[i] = i;
    }

    this.find = function(v){
        if(this.parent[v] == v) 
            return v;
        this.parent[v] = find(this.parent[v]);
        this.height[v] = 1;
        return this.parent[v];
    }

    this.union = function(v1,v2){
        var p1 = this.find(v1);
        var p2 = this.find(v2);
        if(p1 == p2)
            return false;

        if (this.height[p2] < this.height[p1]) 
            this.parent[p2] = p1;
        else if (this.height[p1] < this.height[p2]) 
            this.parent[p1] = p2;
        else {
            this.parent[p2] = p1;
            this.height[p1]++;
        }
        return true;
    }
}