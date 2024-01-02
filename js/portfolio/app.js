document.addEventListener('editor-top-bar-active-change', (e)=>{
    const openEditorTarget = document.querySelector(`.pane-content[data-category="open-editors"] .pane-item[data-path="${e.detail}"]`);
    fileItemClickOpenEditor({target: openEditorTarget, surpress: true});
});

document.addEventListener('editor-top-bar-file-closed', (e)=>{
    const openEditorTarget = document.querySelector(`.pane-content[data-category="open-editors"] .pane-item[data-path="${e.detail}"]`);
    const explorerTarget = document.querySelector(`.pane-content[data-category="explorer"] .pane-item[data-path="${e.detail}"]`);
    openEditorTarget.parentElement.removeChild(openEditorTarget);
    explorerTarget.classList.remove('active');
    saveSideBarState();
});

document.addEventListener('side-bar-active-change', (e)=>{
    const target = document.querySelector(`.editor .top-bar .file-item[data-path="${e.detail}"]`);
    tabClick({target: target, surpress: true});
});

document.addEventListener('side-bar-new-open-file', (e)=>{
    document.querySelector(`.editor .top-bar .file-item.active`)?.classList.remove('active');
    const fileItemPlaceholder = document.createElement('div');
    for(const fileItem of openEditorItems) fileItem.classList.remove('active');
    fileItemPlaceholder.innerHTML = `<div class="file-item active" data-path="${e.detail.path}">
                                        <img class="icon" src="${e.detail.icon}">
                                        <span class="name">${e.detail.name}</span>
                                        <div class="close-action"><i class='bx bx-x'></i></div>
                                    </div>`;
    fileItemPlaceholder.children[0].onclick = tabClick;
    fileItemPlaceholder.children[0].querySelector('.close-action').onclick = closeFile;
    document.querySelector(`.editor .top-bar`).appendChild(fileItemPlaceholder.children[0]);
    openFile(e.detail.path, true);
});

const topBarScrollButtonLeft = document.querySelector('.editor .scroll-buttons .left');
const topBarScrollButtonRight = document.querySelector('.editor .scroll-buttons .right');
var topBarScroll = 0;
const defaultFiles = [{name: 'index.html', path: 'pages/index.html', icon: 'img/icons/html.svg', preventClose: true},{name: 'projects.html', path: 'pages/projects.html', icon: 'img/icons/html.svg', preventClose: true},{name: 'skills.html', path: 'pages/skills.html', icon: 'img/icons/html.svg', preventClose: true}];

this.loadSideBarState();
this.loadEditorTopBarState();

topBarScrollButtonLeft.onclick = () => {
    const topBar = document.querySelector('.top-bar');
    if(!topBar) return;

    topBarScroll += 50;
    if(topBarScroll > 0) topBarScroll = 0;
    topBar.style.transform = `translateX(${topBarScroll}px)`;

    checkTabOverflow();
};

topBarScrollButtonRight.onclick = () => {
    const topBar = document.querySelector('.top-bar');
    if(!topBar) return;
    const scrollButtons = document.querySelector('.editor .scroll-buttons');
    const maxScroll = (topBar.scrollWidth - topBar.parentElement.clientWidth) + scrollButtons.clientWidth;

    topBarScroll -= 50;
    if(topBarScroll < -maxScroll) topBarScroll = -maxScroll;
    topBar.style.transform = `translateX(${topBarScroll}px)`;

    checkTabOverflow();
};

var currentFile = "";
var openEditorItems = Array.from(document.querySelectorAll(`.pane-content[data-category="open-editors"] .pane-item`));
const explorerItems = Array.from(document.querySelectorAll(`.pane-content[data-category="explorer"] .pane-item:not(.directory)`));
const paneHeaders = Array.from(document.querySelectorAll(`.pane-header`));
const dirPaneItems = Array.from(document.querySelectorAll(`.pane-content[data-category="explorer"] .pane-item.directory`));

for(const item of openEditorItems){
    item.onclick = fileItemClickOpenEditor;
    item.querySelector('.close-action').onclick = sideBarCloseFile;
}

for(const item of explorerItems){
    item.onclick = fileItemClickExplorer;
    item.querySelector('.close-action').onclick = sideBarCloseFile;
}

for(const paneHeader of paneHeaders){
    paneHeader.onclick = paneHeaderClick;
}

for(const dirItem of dirPaneItems){
    dirItem.onclick = dirPaneItemClick;
}

function fileItemClickOpenEditor(e){
    const target = e.target;
    // new file (because open editor doesnt contain it currently)
    if(!target){
        const paneItemPlaceholder = document.createElement('div');
        openEditorItems = Array.from(document.querySelectorAll(`.pane-content[data-category="open-editors"] .pane-item`));
        for(const paneItem of openEditorItems) paneItem.classList.remove('active');
        paneItemPlaceholder.innerHTML = `<div class="pane-item active" data-path="${e.path}">
                                            <div class="close-action"><i class='bx bx-x'></i></div>
                                            <img class="icon" src="${e.icon}">
                                            <span class="name">${e.name}</span>
                                        </div>`;
        
        paneItemPlaceholder.children[0].onclick = fileItemClickOpenEditor;
        document.querySelector(`.pane-content[data-category="open-editors"]`).appendChild(paneItemPlaceholder.children[0]);
        document.dispatchEvent(new CustomEvent('side-bar-new-open-file', {detail: {path: e.path, icon: e.icon, name: e.name}}));
        saveSideBarState();
        return;
    }
    if(target.classList.contains('close-action')) return;
    openEditorItems = Array.from(document.querySelectorAll(`.pane-content[data-category="open-editors"] .pane-item`));
    for(const paneItem of openEditorItems) paneItem.classList.remove('active');
    target.classList.add('active');
    const explorerTarget = document.querySelector(`.pane-content[data-category="explorer"] .pane-item[data-path="${target.getAttribute('data-path')}"]`);
    fileItemClickExplorer({target: explorerTarget, surpress: true});
    const path = e.target.getAttribute('data-path');
    if(!e.surpress) document.dispatchEvent(new CustomEvent('side-bar-active-change', {detail: path}));
    openFile(path);
    saveSideBarState();
}

function fileItemClickExplorer(e){
    const target = e.target;
    if(target?.classList?.contains('close-action')){
        // TODO: close active file
        return;
    }
    for(const paneItem of explorerItems) paneItem.classList.remove('active');
    target.classList.add('active');
    const openEditorTarget = document.querySelector(`.pane-content[data-category="open-editors"] .pane-item[data-path="${target.getAttribute('data-path')}"]`);
    if(!e.surpress){
        fileItemClickOpenEditor({target: openEditorTarget, surpress: true, path: target.getAttribute('data-path'), name: target.querySelector('.name').innerHTML, icon: target.querySelector('img').src});
        if(!document.querySelector(`.editor .top-bar .file-item[data-path="${target.getAttribute('data-path')}"]`)) return;
    }
    const path = e.target.getAttribute('data-path');
    if(!e.surpress){
        document.dispatchEvent(new CustomEvent('side-bar-active-change', {detail: path}));
    }
    saveSideBarState();
}

/** collapses/expands panes */
function paneHeaderClick(e){
    const pane = e.target.parentElement.querySelector('.pane-content');
    if(pane.clientHeight > 20) pane.setAttribute('data-height', pane.clientHeight);
    const itemCount = parseFloat(pane.getAttribute('data-height')) / 22;
    if(!e.target.parentElement.getAttribute('data-expanded') || e.target.parentElement.getAttribute('data-expanded') == 'true') e.target.parentElement.setAttribute('data-expanded',false);
    else e.target.parentElement.setAttribute('data-expanded',true);
    pane.slideToggle(Math.max(100 * (itemCount / 4), 100));
    // save state
    saveSideBarState();
}

// expands/collapses directories
function dirPaneItemClick(e){
    const target = e.target;
    // get icon and check update it based on the expanded state if it has a folder type icon
    const children = document.querySelector(`.pane-item-children[data-parent="${target.getAttribute('id')}"]`);
    const icon = target.children[1];
    // if icon is a folder icon and is in open state replace with normal
    if(icon.src.includes('folder') && !icon.src.includes('-open')) icon.src = icon.src.replace('.svg','-open.svg');
    // else use the open icon
    else icon.src = icon.src.replace('-open.svg','.svg');
    target.classList.toggle('expanded');
    children.classList.toggle('expanded');
    saveSideBarState();
}

// load current sidebar state to keep it consistent between reloads
function loadSideBarState(){
    try{
        const state = JSON.parse(localStorage.getItem('sidebar-state'));
        if(state){
            if(!state?.openFiles || state?.openFiles.length == 0) state.openFiles = defaultFiles;
            for(const file of state?.openFiles){
                const fileItemPlaceholder = document.createElement('div');
                fileItemPlaceholder.innerHTML = `<div class="pane-item" ${file.preventClose ? 'data-close="false"' : ''} data-path="${file.path}">
                                                    <div class="close-action"><i class='bx bx-x'></i></div>
                                                    <img class="icon" src="${file.icon}">
                                                    <span class="name">${file.name}</span>
                                                </div>`;
                
                fileItemPlaceholder.children[0].onclick = fileItemClickOpenEditor;
                document.querySelector(`.pane-content[data-category="open-editors"]`).appendChild(fileItemPlaceholder.children[0]);

                const fileItemTopBarPlaceholder = document.createElement('div');
                fileItemTopBarPlaceholder.innerHTML = `<div class="file-item" ${file.preventClose ? 'data-close="false"' : ''} data-path="${file.path}">
                                                    <img class="icon" src="${file.icon}">
                                                    <span class="name">${file.name}</span>
                                                    <div class="close-action"><i class='bx bx-x'></i></div>
                                                </div>`;
                
                fileItemTopBarPlaceholder.children[0].onclick = tabClick;
                document.querySelector(`.editor .top-bar`).appendChild(fileItemTopBarPlaceholder.children[0]);
            }

            for(const paneId in state?.panes){
                const pane = document.querySelector(`.pane[data-pane-id="${paneId}"]`);
                if(state.panes[paneId].expanded === true) pane.setAttribute('data-expanded', true);
                else {
                    pane.setAttribute('data-expanded', false);
                    pane.querySelector('#root-pane-content').setAttribute('data-height',state.panes[paneId].height);
                    pane.querySelector('#root-pane-content').slideToggle(0);
                }
                for(const item of state.panes[paneId].selectedItems){
                    pane.querySelector(`.pane-item[data-path="${item}"]`).classList.add('active');
                }
            }

            for(const dirPath in state?.expandedDirectories){
                const id = state?.expandedDirectories[dirPath];
                const dirItem = document.querySelector(`.pane-content[data-category="explorer"] .pane-item.directory#${id}`);
                const dirWrapper = document.querySelector(`.pane-content[data-category="explorer"] .pane-content[data-parent="${id}"]`);
                const icon = dirItem.querySelector('img.icon');
                // if icon is a folder icon and is in open state replace with normal
                if(icon.src.includes('folder') && !icon.src.includes('-open')) icon.src = icon.src.replace('.svg','-open.svg');
                dirItem.classList.add('expanded');
                dirWrapper.classList.add('expanded');
            }
        } else {
            const openFiles = defaultFiles;
            for(const file of openFiles){
                const fileItemPlaceholder = document.createElement('div');
                fileItemPlaceholder.innerHTML = `<div class="pane-item" ${file.preventClose ? 'data-close="false"' : ''} data-path="${file.path}">
                                                    <div class="close-action"><i class='bx bx-x'></i></div>
                                                    <img class="icon" src="${file.icon}">
                                                    <span class="name">${file.name}</span>
                                                </div>`;
                
                fileItemPlaceholder.children[0].onclick = fileItemClickOpenEditor;
                document.querySelector(`.pane-content[data-category="open-editors"]`).appendChild(fileItemPlaceholder.children[0]);

                const fileItemTopBarPlaceholder = document.createElement('div');
                fileItemTopBarPlaceholder.innerHTML = `<div class="file-item" ${file.preventClose ? 'data-close="false"' : ''} data-path="${file.path}">
                                                    <img class="icon" src="${file.icon}">
                                                    <span class="name">${file.name}</span>
                                                    <div class="close-action"><i class='bx bx-x'></i></div>
                                                </div>`;
                
                fileItemTopBarPlaceholder.children[0].onclick = tabClick;
                document.querySelector(`.editor .top-bar`).appendChild(fileItemTopBarPlaceholder.children[0]);
            }
        }
    } catch(e){
        console.log(e);
    }
}

// save state of the sidebar to keep it consistent between reloads
function saveSideBarState(){
    const state = {panes: {}, expandedDirectories: {}, openFiles: [...defaultFiles]};
    const panes = Array.from(document.querySelectorAll('.pane'));
    for(const pane of panes){
        const expanded = pane.getAttribute('data-expanded') == 'true';
        const selectedItems = [];
        const selectedPaneItems = Array.from(pane.querySelectorAll('.pane-item.active'));
        for(const item of selectedPaneItems){
            if(item.classList.contains('active')){
                selectedItems.push(item.getAttribute('data-path'));
            }
        }
        state.panes[pane.getAttribute('data-pane-id')] = {
            expanded,selectedItems,
            height: pane.clientHeight,
        };
    }

    const directories = Array.from(document.querySelectorAll('.pane-item.directory'));
    for(const dir of directories) if(dir.classList.contains('expanded')) state.expandedDirectories[dir.getAttribute('data-path')] = dir.id;

    const openFiles = Array.from(document.querySelectorAll('.pane-content[data-category="open-editors"] .pane-item'));
    for(const file of openFiles) if(state.openFiles.filter(f => f.path == file.getAttribute('data-path')).length == 0) state.openFiles.push({name: file.querySelector('.name').innerHTML, path: file.getAttribute('data-path'), icon: file.querySelector('img.icon').src});
    localStorage.setItem('sidebar-state', JSON.stringify(state));
}

// array of tabs
const fileTabs = Array.from(document.querySelectorAll(`.editor .top-bar .file-item`));

// add click listeners to tabs
for(const tab of fileTabs){
    tab.onclick = tabClick;
    tab.querySelector('.close-action').onclick = closeFile;
}

// tab click listener
function tabClick(e){
    if(e.target.classList.contains('close-action')) return;

    document.querySelector(`.editor .top-bar .file-item.active`)?.classList.remove('active');
    e.target.classList.add('active');
    const path = e.target.getAttribute('data-path');
    if(!e.surpress) document.dispatchEvent(new CustomEvent('editor-top-bar-active-change', {detail: path}));

    saveEditorTopBarState();
}

// close file from the sidebar
function sideBarCloseFile(e){
    const path = e.target.parentElement.getAttribute('data-path');
    if(!path) return;
    const tab = document.querySelector(`.editor .top-bar .file-item[data-path="${path}"]`);
    if(!tab) return;
    closeFile({target: tab.querySelector('.close-action')});
}

// close file in editor
function closeFile(e){
    const tab = e.target.parentElement;
    const tabs = Array.from(document.querySelectorAll(`.editor .top-bar .file-item`));
    // if there is only one tab we dont need to select the previous tab
    if(tabs.length > 1){
        // remove tab
        const index = tabs.indexOf(tab);
        const path = tab.getAttribute('data-path');
        tab.parentElement.removeChild(tab);
        // open either next or previous tab (if there is one)
        tabClick({target: tabs[index > 0 ? index-1 : index+1]});
        document.dispatchEvent(new CustomEvent('editor-top-bar-file-closed', {detail: path}));
    } else {
        const path = tab.getAttribute('data-path');
        tab.parentElement.removeChild(tab);
        document.dispatchEvent(new CustomEvent('editor-top-bar-file-closed', {detail: path}));
    }

    checkTabOverflow();
}

// load current sidebar state to keep it consistent between reloads
function loadEditorTopBarState(){
    try{
        const state = JSON.parse(localStorage.getItem('editor-top-bar-state'));
        if(state){
            document.querySelector(`.editor .top-bar .file-item[data-path="${state.active}"]`).classList.add('active');
            // open the active file
            openFile(state.active);
        } else {
            const firstFile = document.querySelector(`.editor .top-bar .file-item:first-child`);

            firstFile.classList.add('active');
            // open the active file
            openFile(firstFile.getAttribute('data-path'));
        }
    } catch(e){
        console.log(e);
    }
}

// save state of the top bar in the editor to keep it consistent between reloads
function saveEditorTopBarState(){
    const state = {active: document.querySelector(`.editor .top-bar .file-item.active`)?.getAttribute('data-path')};
    localStorage.setItem('editor-top-bar-state', JSON.stringify(state));
}

// open / select file in editor
// file - path to the file to open
async function openFile(file, jumpTo){
    console.log(file);
    // only open if file is not already shown in editor
    if(file !== currentFile){
        // hide svg preview by default
        const svgPreview = document.querySelector('.editor .svg-preview');
        if(svgPreview) svgPreview.classList.add('hidden');
        // hide content for fade transition
        document.querySelector('.editor .content').classList.add('hidden');
        // after content is faded out load the new file
        setTimeout(async ()=>{
            // if there is a previews svg preview remove it
            if(svgPreview) svgPreview.parentElement.removeChild(svgPreview);
            currentFile = file;
            // read file
            let rawContent = await readFile(file);
            let content;
            // replace html with replacement symbols
            content = rawContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            // check extension and set lang and type
            const extension = file.split('.')[1];
            let lang; let type;
            switch(extension){
                case 'css': lang = 'css'; type = 'lang'; break;
                case 'html': lang = 'html'; type = 'lang'; break;
                case 'js': lang = 'javascript'; type = 'lang'; break;
                case 'ttf': type = 'font'; type = 'font'; break;
                case 'svg': lang = 'svg'; type = 'lang'; break;
                case 'png': case 'gif': case 'jpg': type = 'image'; break;
            }
            document.querySelector('.editor .content').className = `content hidden ${type}`;
            // if type is lang show code file with syntax highlighting
            if(type == 'lang'){
                if(lang === 'html' && (file.startsWith('pages/') || file.startsWith('projects/'))){
                    setInnerHTML(document.querySelector('.editor .content'), rawContent);
                } else {
                    document.querySelector('.editor .content').innerHTML = `<pre><code class="language-${extension}">${content}</code></pre>`;
                    hljs.highlightAll();
                    hljs.initLineNumbersOnLoad({
                        singleLine: true
                    });

                    // if file is an svg show an svg-preview additionally
                    if(lang == 'svg'){
                        const svgPreview = document.createElement('div');
                        svgPreview.className = 'svg-preview hidden';
                        svgPreview.innerHTML = `<div class="title">Preview</div><div class="image-wrapper"><img src="${file}"></div>`;
                        document.querySelector('.editor').appendChild(svgPreview);
                    }
                }
            // for fonts show characters and an example sentence in different sizes
            } else if(type == 'font'){
                const symbols = 'abcdefghijklmnopqrstuvxyzABCDEFGHIJKLMNOPQRSTUVXYZ1234567890.:,;\'"(!?)+-*/=';
                const sentence = 'The quick brown fox jumps over the lazy dog. 1234567890';
                const sizes = [12,18,24,36,48,60,72];
                const fileParts = file.split('/');
                let html = '';
                html = `<div class="title">Characters:</div><div style="font-family: '${fileParts[fileParts.length-1]}';" class='symbols'>${symbols}</div><div class="title">Examples:</div>`;
                for(const size of sizes) html += `<div class='sentence'><span class="font-size">${size}px</span><span style="font-family: '${fileParts[fileParts.length-1]}';font-size: ${size}px;" class="string">${sentence}</span></div>`;
                document.querySelector('.editor .content').innerHTML = html;
            // for an image only show the image
            } else if(type == 'image'){
                document.querySelector('.editor .content').innerHTML = `<img src="${file}">`;
            }

            checkTabOverflow(jumpTo);

            // after another 200 miliseconds fade the new content in again
            setTimeout(()=>{
                document.querySelector('.editor .content').classList.remove('hidden');
                document.querySelector('.editor .svg-preview')?.classList?.remove('hidden');
            },200);
        }, 200);
    }
}

// read the contents of a file and return the content as text
function readFile(file){
    return new Promise((resolve,reject)=>{
        const req = new XMLHttpRequest();
        req.open("GET", file, false);
        req.send();
        // check if request succeeded (else return empty string)
        if (req.status == 200) resolve(req.responseText);
        resolve("");
    });
}

// check if tabs arent fitting in the top bar anymore (show arrows at the left to allow scrolling)
function checkTabOverflow(){
    const topBar = document.querySelector('.top-bar');
    if(!topBar) return;
    const editor = topBar.parentElement;

    // check if tabs are overflowing
    topBar.parentElement.classList.toggle('topbar-overflowing',(editor.clientWidth < topBar.scrollWidth));
    if(!(editor.clientWidth < topBar.scrollWidth)) topBar.style.transform = `translateX(0px)`;
}

function setInnerHTML(elm, html) {
    elm.innerHTML = html;
    
    Array.from(elm.querySelectorAll("script"))
      .forEach( oldScriptEl => {
        const newScriptEl = document.createElement("script");
        
        Array.from(oldScriptEl.attributes).forEach( attr => {
          newScriptEl.setAttribute(attr.name, attr.value) 
        });
        
        const scriptText = document.createTextNode(oldScriptEl.innerHTML);
        newScriptEl.appendChild(scriptText);
        
        oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
    });
}

window.addEventListener('resize', () => {
    checkTabOverflow();
});