/////////////////////////////////////////////////////////////////////////////////////////////////
// Import external javascript module by reqire function.

var websocket = require('socket.io/comx.websocket.js');

/////////////////////////////////////////////////////////////////////////////////////////////////
//System Pre-define functions 

var port = 32768;

function MakeSurePortValid()
{
    while(comx.shell.IsWebSocketPortValid(port) == 'true')
    {
        port++;
    }
}

function sleep(n)
{
    var start=new Date().getTime();
    while(true) if(new Date().getTime()-start>n) break;
}

var is_init = false;
var g_is_need_show_mgr = false;

function OnInitializeData()
{
    SetTimeout(0, function(nID){
        KillTimeout(nID);
        OnHide();

        if(comx.shell.IsWebSocketPortValid(20000) == 'false')
        {
            var root_dir = comx.sys.GetEnvironmentVariables('COMX_SDK');
            var cmd = root_dir + 'bin\\kdesktop.exe -u deamonmgr -e default';

            comx.shell.run_ex(cmd, false, false);
        }
        else
        {
            g_is_need_show_mgr = true;
        }
    });

    SetTimeout(500, function(id){
        if(comx.shell.IsWebSocketPortValid(20000) == 'true')
        {
            if(!is_init)
            {
                is_init = true;
                KillTimeout(id);

                MakeSurePortValid();
                websocket.StartupDeamon(port, websocket.IsDebug());

                websocket.Invoke('ShowDeamonMgr', {}, function(data){});
            }
        }
    });
}

function OnHide()
{
    comx.shell.HideParentWindow(binding.hdr);
}

//OnWebsocketReady

websocket.on('OnWebsocketReady', function(data){
    websocket.Invoke('GetName', {}, function(data){
        binding.name = data.parameters.name;
    });

    websocket.Invoke('GetPort', {}, function(data){
        binding.port_no = data.parameters.port;
    });

    websocket.Invoke('GetConnectionsNum', {}, function(data){
        binding.connect_num = data.parameters.num;
    });
});

function OnInitializePost()
{
}

function OnAnimate()
{
}

function OnCloseForm()
{
    websocket.Stop();
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Input your javascript codes here.

//ConnectionsRefChanged

websocket.on('ConnectionsRefChanged', function(data){
    binding.connect_num = data.parameters.num;
});

function OnExit()
{
    if(parseInt(binding.connect_num) > 0)
    {
        alert('仍有连接存在, 无法终止服务');
        return;
    }
    
    pane.Close();
}

websocket.on('Exit', function(data){
    pane.Close();
});

websocket.on('ShowWindow', function(data){
    comx.shell.ShowParentWindow(binding.hdr);
});