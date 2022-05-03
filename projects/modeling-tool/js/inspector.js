class Inspector{
    static initInspector(sceneObjects){
        sceneObjects.forEach((object)=>{
            var icon = "";

            if(object.type === "cube"){
                icon = "img/icons/mesh_cube.svg";
            } else if(object.type === "light"){
                icon = "img/icons/light.svg";
            }

            if(object.status === 'active'){
                $("#x-input").val(object.element.position.x);
                $("#y-input").val(object.element.position.y);
                $("#z-input").val(object.element.position.z);
            }

            $(".scene-inspector").append(`<div class="inspector-item ${object.status}" id="${object.id}"><div class="icon"><img src="${icon}"></div><div class="name">${object.name}</div></div>`);
        });

        $(".tab-wrapper .tab-item").each(function(){
            $(this).click(function(){
                $(".tab-wrapper .tab-item").removeClass("active");
                $(this).addClass("active");
                $(".tab-content .window").removeClass('active');
                $(".tab-content ."+$(this).attr('href')+"-window").addClass('active');
            });
        });

        $(".inspector-item").each(function(){
            this.onclick = function(){
                $(".inspector-item").removeClass('active');
                $(".inspector-item").addClass('inactive');
                $(this).removeClass("inactive");
                $(this).addClass("active");

                var activeEl;

                sceneObjects.forEach((object)=>{
                    if(object.id === $(this).attr("id")){
                        object.status = 'active';
                        activeEl = object.element;
                    } else {
                        object.status = 'inactive';
                    }
                });

                $("#x-input").val(activeEl.position.x);
                $("#y-input").val(activeEl.position.y);
                $("#z-input").val(activeEl.position.z);
            };
        });

        const xInput = $("#x-input").get(0);
        const yInput = $("#y-input").get(0);
        const zInput = $("#z-input").get(0);

        xInput.onchange = () => {
            sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.position.x = xInput.value;
                    return;
                }
            });
        };

        yInput.onchange = () => {
            sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.position.y = yInput.value;
                    return;
                }
            });
        };

        zInput.onchange = () => {
            sceneObjects.forEach((object)=>{
                if(object.status === 'active'){
                    object.element.position.z = zInput.value;
                    return;
                }
            });
        };
    }
}