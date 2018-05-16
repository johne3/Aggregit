namespace Aggregit.Web.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Threading.Tasks
open Microsoft.AspNetCore.Mvc

type WeatherForcast (dateFomatted:string, temperativeC:float, summary:string) =
    member this.DateFormatted = dateFomatted
    member this.TemperatureC = temperativeC
    member this.Summary = summary

    member this.TemperatureF () =
        (this.TemperatureC / 0.556) + float 32

[<Route("api/[controller]")>]
type SampleDataController () =
    inherit Controller()

    let summaries = [ "Freezing"; "Bracing"; "Chilly"; "Cool"; "Mild"; "Warm"; "Balmy"; "Hot"; "Sweltering"; "Scorching"; ]

    [<HttpGet("[action]")>]
    member this.WeatherForecasts() =
        let rnd = new Random()
        Enumerable.Range(1, 5).Select(fun x -> new WeatherForcast(DateTime.Now.AddDays(float(x)).ToString("d"), float(rnd.Next(-20, 55)), summaries.[rnd.Next(15)]))