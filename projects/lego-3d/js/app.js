const canvas = document.getElementById("editor");
const editor = new Editor(canvas);
const toolbox = new ToolBox(editor);
const inspector = new Inspector(editor);

document.onclick = (e) => {
    if(!e.target.classList.contains('.dropdown') && !e.target.classList.contains('.dropdown-item') && !e.target.classList.contains('.nav-item')){
        Array.from(document.querySelectorAll('.nav-item')).forEach(nav => nav.classList.remove('expanded'));
    }
};

Array.from(document.querySelectorAll('.top-bar .nav-item')).forEach(navItem=>{
    navItem.onclick = (e) => {
        e.stopPropagation();
        Array.from(document.querySelectorAll('.top-bar .nav-item')).forEach(nav => {
            if(nav !== navItem){
                nav.classList.remove('expanded');
            }
        });
        navItem.classList.toggle('expanded');
    }
    Array.from(navItem.querySelectorAll('.dropdown-item')).forEach(dropdownItem=>{
        dropdownItem.onclick = (e) => {
            e.stopPropagation();
            // call editor function for dropdown item
            editor[dropdownItem.getAttribute('data-action')]();
            navItem.classList.remove('expanded');
        };
    });
});