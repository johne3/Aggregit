namespace Aggregit.Web.Options

[<AllowNullLiteral>]
type GitHubApiOptions () =
    member val ClientId : string = null with get, set
    member val ClientSecret : string = null with get, set