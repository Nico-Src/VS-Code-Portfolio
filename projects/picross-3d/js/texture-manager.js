// manager for loading textures
class TextureManager{
    constructor(textureLoader){
        this.textureLoader = textureLoader;
        this.loadedTextures = [];
    }

    // loads texture or if already loaded returns the loaded texture
    load(path){
        // check if loadedTextures array already contains the requested texture
        if(this.loadedTextures.filter(t => t.path === path).length > 0){
            return this.loadedTextures.find(t => t.path === path).tex;
        // else load it and add it to the loadedTextures array
        } else {
            const tex = this.textureLoader.load(path);
            this.loadedTextures.push({path: path, tex: tex});
            return tex;
        }
    }
}