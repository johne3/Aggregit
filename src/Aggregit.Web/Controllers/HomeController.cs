using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Aggregit.Web.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Aggregit.Web.ViewModels.Home;
using System.Net.Http;
using Newtonsoft.Json;
using System.Text;

namespace Aggregit.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly GitHubApiOptions gitHubApiOptions;

        public HomeController(IServiceProvider serviceProvider)
        {
            gitHubApiOptions = serviceProvider.GetService<IOptions<GitHubApiOptions>>().Value;
        }

        [HttpGet]
        public IActionResult Index(string accessToken)
        {
            var vm = new IndexViewModel
            {
                AccessToken = accessToken
            };

            return View(vm);
        }

        public async Task<IActionResult> Authorize(string code)
        {
            var postData = new
            {
                client_id = gitHubApiOptions.ClientId,
                client_secret = gitHubApiOptions.ClientSecret,
                code = code
            };

            var content = new StringContent(JsonConvert.SerializeObject(postData), Encoding.UTF8, "application/json");
            var httpClient = new HttpClient();
            var response = await httpClient.PostAsync("https://github.com/login/oauth/access_token", content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var strings = responseContent.Split("&");
            var accessToken = strings[0].Split("=")[1];

            //TODO: Check for failures
            //https://developer.github.com/apps/managing-oauth-apps/troubleshooting-oauth-app-access-token-request-errors/
            //if (string.Equals(accessToken, "bad_verification_code"))
            //{

            //}

            return RedirectToAction("Index", "Home", new { accessToken = accessToken });
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
