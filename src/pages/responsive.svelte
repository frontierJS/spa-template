<script>
  import { onMount } from "svelte";
  import { auth } from "$frontier";
  import { Field } from "$frontier-c";
  import { goto } from "$router";

  let form = {};
  let url = "http://localhost:5000/styles";

  onMount(() => {});

  function checkForm(e) {
    //currently only checks one at a time
    let target = e.target,
      form;
    while (!form) {
      if (target.tagName === "FORM") form = target;
      else
        target.tagName === "BODY"
          ? (form = "not found")
          : (target = target.parentElement);
    }

    for (let el of form) {
      if (el.willValidate && !el.checkValidity()) return el.reportValidity();
    }
  }

  function login(e) {
    e.preventDefault();
    console.log({ e });
    //TODO if (event.target.valid) //add to @frontierjs/frontend
    // if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
    if (e.target.form.reportValidity()) $auth.login(form, "/", $goto);
  }
  function updateIframe() {
    let frames = Array.from(document.getElementsByTagName("iframe"));
    frames.forEach(frame => {
      frame.src = url;
    });
  }
</script>

<section>
  <div id="tools">
    <form action="" method="get">
      <input id="url" name="url" type="text" placeholder="" value={url} />
      <input
        type="submit"
        value="Go"
        id="go"
        on:click|preventDefault={updateIframe} />
    </form>

  </div>
  <section id="devices">
    <div class="deviceWrap iphone-x-portrait" style="min-width: 427px;">
      <div
        class="device"
        style=" width: 375px; height: 685px; padding-top: 44px; padding-bottom:
        83px; ">
        <div class="flashingTop" style="height: 44px; width: 375px;">
          <span class="time" />
        </div>
        <div class="flashingBottom" style="height: 83px;" />
        <iframe src="https://{url}/" id="iphone-x-portrait" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 427px;">
      <a
        href="/?url=https://{url}/&amp;device=iphone-x&amp;orientation=portrait">
        <em>
          iPhone eXpensive portrait
          <span>· width: 375px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap iphone-x-landscape" style="min-width: 866px;">
      <div class="device" style="width: 734px; height: 375px;">
        <iframe src="https://{url}/" id="iphone-x-landscape" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 866px;">
      <a
        href="/?url=https://{url}/&amp;device=iphone-x&amp;orientation=landscape">
        <em>
          iPhone eXpensive landscape
          <span>· width: 734px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap android-pixel-2-portrait" style="min-width: 458px;">
      <div
        class="device"
        style="width: 412px; height: 661px; padding-top: 23px;">
        <div class="flashingTop" style="height: 23px; width: 412px;">
          <span class="time" />
        </div>
        <iframe src="https://{url}/" id="android-pixel-2-portrait" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 458px;">
      <a
        href="/?url=https://{url}/&amp;device=android-pixel-2&amp;orientation=portrait">
        <em>
          Android (Pixel 2) portrait
          <span>· width: 412px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap android-pixel-2-landscape" style="min-width: 954px;">
      <div
        class="device"
        style="width: 684px; height: 389px; padding-top: 23px;">
        <div class="flashingTop" style="height: 23px; width: 684px;">
          <span class="time" />
        </div>
        <iframe src="https://{url}/" id="android-pixel-2-landscape" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 954px;">
      <a
        href="/?url=https://{url}/&amp;device=android-pixel-2&amp;orientation=landscape">
        <em>
          Android (Pixel 2) landscape
          <span>· width: 684px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap iphone-6-portrait" style="min-width: 423px;">
      <div
        class="device"
        style=" width: 375px; height: 603px; padding-top: 20px; padding-bottom:
        44px; ">
        <div class="flashingTop" style="height: 20px; width: 375px;">
          <span class="time" />
        </div>
        <div class="flashingBottom" style="height: 44px;" />
        <iframe src="https://{url}/" id="iphone-6-portrait" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 423px;">
      <a
        href="/?url=https://{url}/&amp;device=iphone-6&amp;orientation=portrait">
        <em>
          iPhone 6-8 portrait
          <span>· width: 375px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap iphone-6-landscape" style="min-width: 422px;">
      <div
        class="device"
        style=" width: 667px; height: 311px; padding-top: 20px; padding-bottom:
        44px; ">
        <div class="flashingTop" style="height: 20px; width: 667px;">
          <span class="time" />
        </div>
        <div class="flashingBottom" style="height: 44px;" />
        <iframe src="https://{url}/" id="iphone-6-landscape" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 422px;">
      <a
        href="/?url=https://{url}/&amp;device=iphone-6&amp;orientation=landscape">
        <em>
          iPhone 6-8 landscape
          <span>· width: 667px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap iphone-6-plus-portrait" style="min-width: 461px;">
      <div
        class="device"
        style=" width: 414px; height: 672px; padding-top: 20px; padding-bottom:
        44px; ">
        <div class="flashingTop" style="height: 20px; width: 414px;">
          <span class="time" />
        </div>
        <div class="flashingBottom" style="height: 44px;" />
        <iframe src="https://{url}/" id="iphone-6-plus-portrait" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 461px;">
      <a
        href="/?url=https://{url}/&amp;device=iphone-6-plus&amp;orientation=portrait">
        <em>
          iPhone 6-8 Plump portrait
          <span>· width: 414px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap iphone-6-plus-landscape" style="min-width: 946px;">
      <div
        class="device"
        style=" width: 736px; height: 350px; padding-top: 20px; padding-bottom:
        44px; ">
        <div class="flashingTop" style="height: 20px; width: 736px;">
          <span class="time" />
        </div>
        <div class="flashingBottom" style="height: 44px;" />
        <iframe src="https://{url}/" id="iphone-6-plus-landscape" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 946px;">
      <a
        href="/?url=https://{url}/&amp;device=iphone-6-plus&amp;orientation=landscape">
        <em>
          iPhone 6-8 Plump landscape
          <span>· width: 736px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap ipad-portrait" style="min-width: 973px;">
      <div
        class="device"
        style="width: 768px; height: 929px; padding-top: 95px;">
        <div class="flashingTop" style="height: 95px; width: 768px;">
          <span class="time" />
        </div>
        <iframe src="https://{url}/" id="ipad-portrait" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 973px;">
      <a href="/?url=https://{url}/&amp;device=ipad&amp;orientation=portrait">
        <em>
          iPad portrait
          <span>· width: 768px</span>
        </em>
      </a>
    </div>

    <div class="deviceWrap ipad-landscape" style="min-width: 1249px;">
      <div
        class="device"
        style="width: 1024px; height: 675px; padding-top: 93px;">
        <div class="flashingTop" style="height: 93px; width: 1024px;">
          <span class="time" />
        </div>
        <iframe src="https://{url}/" id="ipad-landscape" style="" />
      </div>
      <!-- /device -->
    </div>
    <!-- /deviceWrap -->
    <div class="deviceTitle" style="min-width: 1249px;">
      <a href="/?url=https://{url}/&amp;device=ipad&amp;orientation=landscape">
        <em>
          iPad landscape
          <span>· width: 1024px</span>
        </em>
      </a>
    </div>
  </section>
  <script>
    (function() {
      /*
        var urlParams = new URLSearchParams(window.location.search)
        url = urlParams.get('url')
        console.log(url)
        let doc = document.documentElement.innerHTML
        let regex = new RegExp(/{url}/)
        let newdoc = doc.replace('url', url)
        console.log(newdoc)
        document.documentElement.innerHTML = doc
        */

      let frames = Array.from(document.getElementsByTagName("iframe"));
      frames.forEach(frame => {
        frame.src = "http://localhost:5000/dashboard";
      });
    })();
  </script>
</section>
