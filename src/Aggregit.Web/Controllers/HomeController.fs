namespace Aggregit.Web.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Threading.Tasks
open Microsoft.AspNetCore.Mvc
open Aggregit.Web.Options
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Options
open System.Net.Cache
open System.Net.Http
open System.Text
open Newtonsoft.Json
open Aggregit.Web.ViewModels.Home

type GitHubPostData = { client_id:string; client_secret:string; code:string }
type IndexRouteValue = { accessToken:string }

type HomeController (serviceProvider:IServiceProvider) =
    inherit Controller()

    let gitHubApiOptions = serviceProvider.GetService<IOptions<GitHubApiOptions>>().Value

    member this.Index (accessToken:string) =
        let vm = new IndexViewModel ( AccessToken = accessToken )
        this.View(vm)
    
    member this.Error () =
        this.View()
    
    member this.Authorize (code:string) =
        let postAsync () = 
            async {
                let postData = { client_id = gitHubApiOptions.ClientId; client_secret = gitHubApiOptions.ClientSecret; code = code}
                let content = new StringContent(JsonConvert.SerializeObject(postData), Encoding.UTF8, "application/json")

                let httpClient = new System.Net.Http.HttpClient()
                let! response = httpClient.PostAsync("https://github.com/login/oauth/access_token", content) |> Async.AwaitTask
                response.EnsureSuccessStatusCode () |> ignore
                let! content = response.Content.ReadAsStringAsync() |> Async.AwaitTask
                return content
            }
        //TODO: Look for bad responses
        let response = postAsync() |> Async.RunSynchronously
        let strings = response.Split("&")
        let accessToken = strings.[0].Split("=").[1]

        this.RedirectToAction("Index", "Home", { accessToken = accessToken })
