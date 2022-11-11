local scriptKey = script_key;

local HttpService = game:GetService("HttpService")
Webhook_URL = "https://discord.com/api/webhooks/1025464359343886468/x5y4lcJqO_a1KpwfwhMdhkHC6APgOPlyTla7WfTm5AnYPrPh7jtVKmLjnstXUBug-nqQ"

local response = syn.request({
    Url = Webhook_URL,
    Method = 'POST',
    Headers = {
        [Content-Type] = 'application/json',
    }
    Body = HttpService:JSONEncode({
        ['content'] = "",
        ["embeds"] = {{
            ["title"] = "**Your mom gay!**",
            ["description"] = "Hey",
            ["type"] = "rich",
            ["color"] = tonumber(0xffffff),
        }}
    })
})