using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace bckend.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class SessionRequestAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(
        ActionExecutingContext context)
    {
        context.HttpContext.Response.Headers["Cache-Control"] =
            "no-store";

        if (context.HttpContext.Request.Headers[
                "X-Session-Request"] != "1")
        {
            context.Result = new ObjectResult(
                "Missing session request header.")
            {
                StatusCode = 403
            };
        }
    }
}