local scriptId = "INSERTSCRIPTID";

if not script_key then
    return print("[LuaLock]: > No script Key was found, please add a script_key global variable to use auth with! < :[LuaLock]");
end

print("[LuaLock]: [1/5] > Authenticating to servers... < :[LuaLock]");

wait(0.5);

local Websocket = nil;

if syn then
    Websocket = syn.websocket.connect("ws://localhost:8888");
elseif KRNL_LOADED then
    Websocket = Krnl.WebSocket.connect("ws://localhost:8888");
end

wait(0.5);

Websocket:Send("INITIATEAUTHENTICATION," ..scriptId.. ",NONE");

Websocket.OnMessage:Connect(function(Msg)
    if Msg == "INVALIDSCRIPTID" then
        return print("[LuaLock]: > That specific script could not be found, please contact the LuaLock Developer! < :[LuaLock]");
    elseif Msg == "VALIDSCRIPTID" then
        print("[LuaLock]: [2/5] > Confirming valid connection... < :[LuaLock]");
        
        wait(0.5);
        
        Websocket:Send("REQUESTINGAUTHENTICATIONKEY," ..script_key.. "," ..scriptId);
    elseif Msg == "INVALIDSCRIPTAUTHENTICATIONKEY" then
        return game.Players.LocalPlayer:Kick("[LuaLock]: > Invalid Script Key, that Script Key is not valid for that Script! < :[LuaLock]");
    elseif Msg == "VALIDSCRIPTANDAUTHENTICATIONKEY" then
        print("[LuaLock]: [3/5] > Checking with licensing servers... < :[LuaLock]");
        
        wait(0.5);
        
        Websocket:Send("REQUESTINGWHITELISTCHECK," ..script_key.. "," ..scriptId);
    elseif Msg == "NOTSUPPORTEDEXECUTORTYPE" then
        return print("[LuaLock]: > It does not seem like that executor is currently supported by LuaLock! < :[LuaLock]");
    elseif Msg == "INITIATEFINALPHASE" then
        print("[LuaLock]: [4/5] > Successfully authenticated to servers! < :[LuaLock]");
        
        wait(0.5);
        Websocket:Send("INITIATEXECUTORWLCHECK," ..script_key.. "," ..scriptId);

    elseif Msg == "NOTCORRECTEXECUTORWLID" then
        return print("[LuaLock]: > The whitelisted executor ID does not match this executor ID! Contact Script Owner. < :[LuaLock]");
    elseif Msg == "FINALEXECUTORCHECKWASCORRECT" then
        print("[LuaLock]: [5/5] > Fully Authenticated, executing script! < :[LuaLock]");

        wait(0.5);

        Websocket:Send("REQUESTINGAUTHENTICATEDLOADERSCRIPT," ..scriptId.. ",NONE");
    elseif Msg == "SCRIPTWASREMOVEDBEFORE" then
        return game.Players.LocalPlayer:Kick("[LuaLock]: > Heartbeat recived, the executed script was removed! < :[LuaLock]");
    elseif Msg == "SCRIPTKEYWASREMOVEDBEFORE" then
        return game.Players.LocalPlayer:Kick("[LuaLock]: > Heartbeat recived, the script key was blacklisted! < :[LuaLock]");
    elseif Msg == "RECIEVEDHEARTBEATSUCCESS" then
        print("[LuaLock]: > Recieved Heartbeat... < :[LuaLock]");
    else
        loadstring(Msg)(); -- MAKE A while wait(300) do LOOP, FOR EVERY 5 MIN RECHECK FOR POSSIBLE AUTH CHANGES!

        while wait(300) do
            Websocket:Send("REQUESTINGHEARTBEATRN," ..script_key.. "," ..scriptId);
        end
    end
end);

Websocket.OnClose:Connect(function()
    return game.Players.LocalPlayer:Kick("[LuaLock]: > Lost Heartbeat to Websocket, was it restarted? < :[LuaLock]");
end);


--[[ [OLD SCRIPT] (USING API AS AUTH)
local scriptId = "INSERTSCRIPTID";

if not script_key then
    return print("[LuaLock]: > No script Key was found, please add a script_key global variable to use auth with! < [LuaLock]");
end
    
print("[LuaLock]: [1/4] > Authenticating to servers... < [LuaLock]");
    
wait(1)
    
local Response = nil;

if syn then
    Response = syn.request({
       Url = "https://api.lualock.com/v1/auth/loader/" ..scriptId.. "/" ..script_key,
       Method = "GET",
       headers = {
           ["Content-Type"] = "application/json"
        }
    });
elseif KRNL_LOADED then
    Response = request({
        Url = "https://api.lualock.com/v1/auth/loader/" ..scriptId.. "/" ..script_key,
        Method = "GET",
        headers = {}
    });
end
    
local apires = Response.Body;
    
if apires == "SCRIPTINVALID" then
    return print("[LuaLock]: > Something went wrong while executing the script, please contact the Developer ASAP! < [LuaLock]");
end

if apires == "WHITELISTINGID" then
    return print("[LuaLock]: > Whitelisting your executor ID, please re-execute the script again! < [LuaLock]");
end

if apires == "NOTCORRECTEXECUTOR" then
    return print("[LuaLock]: > Invalid Executor ID, this script_key was whitelisted with another executor ID! < [LuaLock]");
end

if apires == "NOTAUTHORIZED" then
   return print("[LuaLock]: > No auth header was sent, is this executor supported by LuaLock? < [LuaLock]");
end
    
if apires == "Invalid Endpoint" then
    return print("[LuaLock]: > Failed to load, Invalid API Endpoint? < [LuaLock]")
end
    
print("[LuaLock]: [2/4] > Checking with api servers... < [LuaLock]");
    
wait(1);
if apires == "Too many requests, please try again later." then
    return print("[LuaLock]: > You are being ratelimited, try executing again in 15 seconds! < [LuaLock]");
end
    
print("[LuaLock]: [3/4] > Connecting to licensing servers < [LuaLock]");
    
wait(0.5);
if apires == "UNAUTHENTICATED" then
    return game.Players.LocalPlayer:Kick("[LuaLock]: > Invalid Script Key, contact Support for further help! < [LuaLock]");
end

if apires == "" then
   return print("[LuaLock]: > Script was not returned, contact the LuaLock Developer! < [LuaLock]");
end
    
print("[LuaLock]: [4/4] > Successfully authenticated to servers! < [LuaLock]");
wait(1);
    
return loadstring(apires)();--]]