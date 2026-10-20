vcl 4.1;

backend default {
    .host = "haih-site-origin";
    .port = "3000";
}

sub vcl_recv {
    # Keep the proxy path representative without retaining development output.
    return (pass);
}

sub vcl_deliver {
    set resp.http.X-Cache = "PASS";
    set resp.http.Cache-Control = "no-store";
}
