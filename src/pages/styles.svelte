<script>
  import { Field } from "$frontier-c";
  let name = "";
  let lastName = "Knight";
  let email = "";
  let password = "";
  let number = 2;
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
  $: pClass = " box _x";
  $: cClass = "-x";
  $: formClass = "grid";

  $: formEx = `
    <div class="${formClass}"> // Below
    <form> ... </form>
    <div> Lorem... </div>
    ....
    </div>
  `;
  $: childEx = `
    <div class="grid"> //Green with editor
    ...
    </div>
    <article class="${cClass}"> // Editor
    ${formEx}
    </article>
    <div>
    ...
    </div>
  `;
  $: parentEx = `
  <section class="${pClass}"> // Grey
    ${childEx}
  </section>
  `;

  let codeEnd = `
  `;
  function updateParent(e) {
    let classString = parentEx
      .match(/"((?:\\.|[^"\\])*)"/)[0]
      .replace(/['"]+/g, "");
    pClass = classString;
  }
  function updateChild(e) {
    let classString = childEx.match(/".*"/g);
    cClass = classString[0].replace(/['"]+/g, "");
    formClass = classString[1].replace(/['"]+/g, "");
  }
  $: textClass = "-r";
  $: textEx = `
  <h4 class="${textClass}">Header 4</h4>
  <p class="${textClass}">Paragraph</p>
  <span class="${textClass}">span</span>
  `;
  function updateText(e) {
    let classString = textEx.match(/".*"/g);
    console.log(classString);
    textClass = classString[0].replace(/['"]+/g, "");
  }
  let settingsCss = `
    @import 'e-mixins';
    @import 'e-reset';
    @import 'e-base';
  `;
  let generalCss = `
  @import 'u-containers'; // box, grid, & flex;
  @import 'u-text';       // text elements;
  @import 'u-generic';    // paddings, margins, etc..;
  `;
  let componentsCss = `
  @import 'c-form-input';
  @import 'c-button';
  `;
</script>

<style>
  .obj {
    padding: 40px;
    background-color: #e2e3e5;
  }
</style>

<section style="background-color: #bada55;" class="box x">
  <!--        

  <div class="grid" style="">
    <article class="">
      <p class="x">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est error, cum
        soluta quibusdam inventore dicta, minus recusandae quae porro tempore
        ipsa quos repudiandae facere dolores. Minus harum sed officiis sit?
      </p>
      <p class="y">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est error, cum
        soluta quibusdam inventore dicta, minus recusandae quae porro tempore
        ipsa quos repudiandae facere dolores. Minus harum sed officiis sit?
      </p>
      <p class=" y c">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est error, cum
        soluta quibusdam inventore dicta, minus recusandae quae porro tempore
        ipsa quos repudiandae facere dolores. Minus harum sed officiis sit?
      </p>
    </article>
    <p class="_l">Paragraph of text _l</p>
    <p class="_r">Paragraph of text _r</p>
    <span class="el a">Span in the middle</span>
    <button class="_r">Button _r</button>
    <button class="el" style="">El Button</button>
    <button class="block y" style="">
      <div class=" _l">
        <span class="c">Sign In</span>
      </div>
      <span>One more thing,,</span>
      <span>This button is a block</span>
    </button>
  </div>
  <div class="block p" style="">
    <p class="_l">Paragraph of text _l</p>
    <span class="">Span in the middle</span>
    <button class="_r">Button _r</button>
    <button class="el c -c " style="width:230px">El Button</button>
    <button class="_c" style="width:230px">
      <span>Sign</span>
      <span>In</span>
    </button>
  </div>
-->
  <div class="reader">
    <article debug>
      <h3>Row</h3>
      <div class="row c">
        <span class="">
          A rowdddddd is full width and a vertically stacked container
        </span>
        <span>A row is full width and a vertically stacked container</span>
        <span>A row is full width and a vertically stacked container</span>
      </div>
    </article>
    <article class="table-contents _mb_">
      <h1 class="vx++">Philosophy</h1>
      <h2 class="">
        Relationships
        <small>
          <span class="v-">(Parent `x` & Children `_x` & Child '-x')</span>
        </small>
      </h2>
      <article class="">
        <h3>Siblings</h3>
        <div>
          <span>We have to ask ourselves this question</span>
          <br />
          <i class="py fw600">
            When do 2 elements really become siblings and belong to the same
            parent
          </i>
          <p class="">It should be based on 1 thing:</p>
          <ol class="">
            <li>
              Could this element remain if the above where to disappear or move?
            </li>
          </ol>
          <p>
            Once it is established that 2 elements are born together and die
            together. We see they need to be under the same `parent`.
          </p>
          <p>This parent is a `container` of its children.</p>
          <p>The containers that can exist are:</p>
          <ol class="pl">
            <li>- El</li>
            <li>- Rows</li>
            <li>- Blocks</li>
            <li>- Boxes</li>
          </ol>
          <p>
            The only other element is `Text` but it is never meant to be a
            `container`
          </p>
          <p>The Main or Body tag acts as our `godfather`</p>
          <p>
            From it, we form our first children (section,header,footer) that
            will be parents of their own if it be only containing 1 `text`
            element.
          </p>
          <p>
            And it is the `text` that forms the fundamental building blocks and
            therefore what we must discuss next.
          </p>
        </div>
      </article>
      <article>
        <h3 class="hide v_">Visual Text (V)</h3>
        <div class="">
          <p class="v+ py px** mx*">
            <strong>`Text`</strong>
            is the most basic form of an element because it is the visual
            content we want to see.
          </p>
          <p>It is comprised of 4 main characters:</p>
          <ol class="pl">
            <li>- Size</li>
            <li>- Weight (100-900)</li>
            <li>- Spacing (X)</li>
            <li>- Height (Y)</li>
            <li>- Alignment(L C R)</li>
          </ol>
          <p>Other considerations are:</p>
          <ol class="pl">
            <li>- Color</li>
            <li>- Style (Italic)</li>
            <li>- Case (Upper, Lower)</li>
          </ol>
          <article>
            <h5 class="mt">Size</h5>
            <p>
              A default "root" font-size is set at 12px and increases to 16px as
              the screen size increases
            </p>
            <p>
              From here we go through this path of logic to reduce options down
              to 2:
            </p>
            <p>
              If I don't want the default (or need to reset to default), do I
              want larger or smaller?
            </p>
            <p>
              Then, do I want something much greater than the current value?
            </p>

            <p>This end a</p>
            <iframe
              class="w@md"
              frameborder="0"
              style="width:100%;height:668px;"
              src="https://app.diagrams.net?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=FCSS#R5ZpZc5s6FMc%2FjV8y4zssZvFjbSdt76TTTtNO06eMDMKoEchXCC%2F59JVAGLCw69x6AeclQUfLQT%2FJ%2FyMJ9cxxtHpPwTz8RHyIe4bmr3rmpGcYuu4a%2FJ%2BwrHOLM7Bzw4wiXxYqDQ%2FoBUqjJq0p8mFSK8gIwQzN60aPxDH0WM0GKCXLerGA4LrXOZhBxfDgAaxafyCfhUW%2FNK3M%2BADRLJSuXUtmRKAoLA1JCHyyrJjM2545poSw%2FClajSEW8Aoueb27HbmbF6MwZodUmNyRfno3%2Fka%2F9SPP%2Ffrzw%2FjzqG%2FmrSwATmWH5cuydUEA%2BhyITBLKQjIjMcC3pXVESRr7ULjReKosc0%2FInBt1bvwFGVvL0QUpI9wUsgjLXLUrsncJSakH97x%2FMSUAnUG2p5zsluhLxYEE9R6SCDK65gUoxIChRX3wgZxDs025EjN%2FkKRfQd1%2BI9StVlHXFeo%2FAO851yYYgBSLpyRjdaeMRp31MkQMPsxBxmjJda%2FONUAYjwkmNKtr%2BgC6gcftCaPkGVZybM%2BF02DfSCwgZXC1l53MdaXKSJkd2JL9siJahRKFFb2ytVPR1jo%2Bya0DJ%2FmwXZPcfSPYdadV3C0F%2B73oAT22mgRBYHiNauLbU9uyj6MmptM2OTE6HzOdQ5cq7YqahnMJznCF2GPl%2Bado6h9LpiYr2XKWWBeJmPf3sZqo1BLJslqWKuqdY0y1Vo1p8d6VH9On1Au55SECGHdVtWyrdaqlhoXvCewZNl9tmqMp5U8z8bR4Et5jXxR9ejoqet%2BCrj9oQu8aU9M%2BEXpbuzh6df3ZjL5fou%2F3O4jeHbRt1utGx2P18EBZ1%2FV2yfrgrXA3W8V9uCuaXtMWwCjSl5MV9bCyWdFvSkW%2Fuemgom%2Bj182Lo1fPzprR94xRCT9LjDo4ANawbXNfjaiLDnJ127ZIVAPmGiYKWN47VqcHMJrF%2FNnjLITAjwQD5AH8TmZEyPfzaAoT9AKmWVNiWOYExSzrhjXqWRPRFg%2Bg%2Bbnz%2Fuh5OGZ9a0VoWSrnQQNm41SY1e1mTDpP2Sg2d8W621Epm%2BekrKubzSvAbJlbWuyqWnxezOpJ5DWIxmCbc8Oi46yioavL6muYztu79UurhnGdMdDRWxYDDfXD3BVMZ2d4uek88tPn%2B3%2BTycfH7y%2B%2FJu4Caeuw4SN%2FS2azwrSB%2FMHiPNDOJ86NmNX9SLEZ9NGixtr%2BLxU3nEYBiVk%2Fp%2FKOF9Cd%2BarMFK8oOZdGDANWLZJvMQs%2For3%2F4yhv5QvynlE84%2Fks5PtYjWbM5AUQcU1MNJ474nxksuafm7Ou1q3d6H0iv%2FIYGhF%2FcHlMtb2h3225QizZpxcbRGKrHE%2BTeZ61ldYOKJLzTZhKb3GAh79Na5vhVb919I%2FZweaPKUdov9lf43HTqWEqr7K5LNZ89nV0f%2BLHucvZofV3HJKenJUUlgbnR%2FCet970I3ulRG2tDf5wcAaSeX7POEArcdi2WTlkynScaF8P9g0b3o2tFuzd10d7nixvIGd5lXvc5u1v" />
          </article>

        </div>
        <span class="v__">V__ text</span>
        <span class="v_">V_ text</span>
        <span class="v--">V-- text</span>
        <span class="v-">V- text</span>
        <p>
          <span class="v">V Default text</span>
        </p>
        <span class="v+">V+ text</span>
        <span class="v++">V+ text</span>
        <span class="v*">V* text</span>
        <span class="v**">V** text</span>
        <hr />
        <div class="v__">V__ text</div>
        <div class="v_">V_ text</div>
        <div class="v--">V-- text</div>
        <div class="v-">V- text</div>
        <div class="v">V Default text</div>
        <div class="v+">V+ text</div>
        <div class="v++">V++ text</div>
        <div class="v*">V* text</div>
        <div class="v**">V** text</div>
        <small>
          <div class="v** v700">default text</div>
        </small>
        <big>
          <div class="v** v700 m__ ">default text</div>
        </big>
        <hr />
        <article>
          <h3>Element</h3>
          <p>A element becomes flex when layout is set. default row</p>
          <p>A row is full width and a vertically stacked container</p>
        </article>
        <article>
          <h3>Row</h3>
          <div class="row c">
            <span>A row is full width and a vertically stacked container</span>
          </div>
        </article>
        <article>
          <h3 class="">Block</h3>
          <p>A block is full width and a horizontally stacked container</p>
        </article>
        <h3>Box, Grid and Containers</h3>
        <article>
          <h4>Containers/Blocks (flex)?</h4>
          <p>A container becomes flex when layout is set. default column</p>
        </article>
        <article>
          <h4>Boxes and box items</h4>
          <p>
            A box assumes it is dealing with blocks and so you have to declare
            `el`
          </p>
          <p>
            A container assumes it is dealing with elements and so you have to
            declare `block`
          </p>
          <p>Being a box item just does 5 things:</p>
          <ul class="block -c">
            <li class="el -l">1. Display: block</li>
            <li>2. width: 100%</li>
            <li>3. Sets your min-width not to get smaller than an 256px</li>
            <li>4. Sets your max-width not to get larger than the box</li>
            <li>5. sets margins for the item appropriately</li>
          </ul>
        </article>
        <h4>Grids and grid items</h4>
        <h2>Sizing (Width/Padding/Margins)</h2>
        <h3>Width & Height</h3>
        <h3>Padding</h3>
        <h4>Background of a block is the padding</h4>
        <h3>Margin</h3>
        <h2>Spacing (Layout/Position)</h2>
        <h3>Center & All</h3>
        <h3>X axis</h3>
        <h3>Left and Right</h3>
        <h3>Y axis</h3>
        <h4>Top and Bottom</h4>
        <h2>Breakpoints</h2>
        <h3>A Block (8rem / 128px)</h3>
        <h3>10 sizes of concern (128 to 1280)</h3>
        <h3>The Cross Axises</h3>
        <h2>Core Elements</h2>
        <h3>Forms & Inputs</h3>
        <h3>Buttons</h3>
        <h2>The Defaults</h2>
        <h2>FrontierCSS Structure</h2>
        <h2>Misc</h2>
        <h6>Backgrounds should padding auto applied</h6>
      </article>
    </article>
  </div>
  <figure class="ce ce-lift ce-twist" style="">
    <figcaption class="ce_caption">
      <h3>// Settings</h3>
    </figcaption>
    <pre class="ce_pre">
      <code contenteditable spellcheck="false" class="language-css">
        {settingsCss}
      </code>
    </pre>
  </figure>
  <figure class="ce ce-lift ce-twist" style="">
    <figcaption class="ce_caption">
      <h3>// General</h3>
    </figcaption>
    <pre class="ce_pre">
      <code contenteditable spellcheck="false" class="language-css">
        {generalCss}
      </code>
    </pre>
  </figure>

  <figure class="ce ce-lift ce-twist" style="">
    <figcaption class="ce_caption">
      <h3>// Components</h3>
    </figcaption>
    <pre class="ce_pre">
      <code contenteditable spellcheck="false" class="language-css">
        {componentsCss}
      </code>
    </pre>
  </figure>
  <div
    class="grid"
    style="background-color: #d4edda; border: 3px solid #c3e6cb;">
    <h2 class="_c">Child of box</h2>
    <figure class="ce ce-lift ce-twist" style="min-width:356px">
      <figcaption class="ce_caption">
        <h3>Relationships</h3>
      </figcaption>
      <pre class="ce_pre">
        <code
          contenteditable
          spellcheck="false"
          class="language-html"
          bind:textContent={parentEx}
          on:keyup={updateParent} />
      </pre>
    </figure>
  </div>
  <article class={cClass}>
    <figure class="ce ce-lift ce-twist" style="width:100%; max-width: 100%;">
      <figcaption class="ce_caption">
        <h3>Child of box (I'm the article tag below)</h3>
      </figcaption>
      <pre class="ce_pre">
        <code
          contenteditable
          spellcheck="false"
          class="language-html"
          bind:textContent={childEx}
          on:keyup={updateChild} />
      </pre>
    </figure>
    <div class={formClass} style="background-color: #cce5ff;">
      <form style="min-width:500px">
        <Field classes="" name="name" value={name} />
        <Field classes="" name="email" type="email" value={email} />
        <Field name="password" type="password" value={password} />
        <Field label="Numberfield" type="number" name="number" value={number} />
        <Field name="last_name" value={lastName} />
        <button
          class=""
          on:mouseenter={checkForm}
          on:click={() => alert('Good Test')}>
          Sign Up
        </button>
      </form>
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolore
          officiis ducimus reprehenderit optio aliquam repellendus architecto
          odio maiores. Itaque adipisci nam laboriosam doloribus assumenda totam
          at voluptates commodi minima?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolore
          officiis ducimus reprehenderit optio aliquam repellendus architecto
          odio maiores. Itaque adipisci nam laboriosam doloribus assumenda totam
          at voluptates commodi minima?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolore
          officiis ducimus reprehenderit optio aliquam repellendus architecto
          odio maiores. Itaque adipisci nam laboriosam doloribus assumenda totam
          at voluptates commodi minima?
        </p>
      </div>
      <button
        class="_r"
        on:mouseenter={checkForm}
        on:click={() => alert('More info')}>
        More Info
      </button>
    </div>
  </article>

  <div style="background-color:#fff3cd;">
    <div class="m -p-lg" style="background-color:white;">
      <h4 class={textClass}>Header 4</h4>
      <p class={textClass}>Paragraph</p>
      <span class={textClass}>span</span>
    </div>
    <h2 class="_c">Working with Inline Text</h2>
    <figure class="ce ce-lift ce-twist" style="min-width:356px">
      <figcaption class="ce_caption">
        <h3>Text</h3>
      </figcaption>
      <pre class="ce_pre">
        <code
          contenteditable
          spellcheck="false"
          class="language-html"
          bind:textContent={textEx}
          on:keyup={updateText} />
      </pre>
    </figure>

  </div>
  <div>
    <div class="box border mb -pb">
      <div class="-x obj">-x</div>
      <div class="-l obj">-l</div>
      <div class="-r obj">-r _c</div>
      <div class="el -c obj _c">-c el _c</div>
      <div class="x border">
        <h4 class="el _r">Header 4 -r</h4>
        <p class="el _x">Paragraph</p>
        <span class="el _c">span</span>
        <p>.box.x</p>
        <p>.box.x@$bp</p>
        <p>.box.-x > *</p>
        <p>.box.-x@$bp > *</p>
        <p>.box > ._x</p>
        <p>.box > ._x@$bp</p>
      </div>
    </div>
  </div>
</section>
