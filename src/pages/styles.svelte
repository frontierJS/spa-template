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
  $: pClass = "bg box -x";
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

<section class={pClass}>
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
  <div>
    <article class="table-contents block -mb">
      <h1 class="_c">Style Guide</h1>
      <h2 class="">
        Relationships
        <small>(Parent `x` & Children `-x` & Child '_x')</small>
      </h2>
      <article>
        <h3>Text</h3>
        <p>
          `Text` is the most basic form of an element. At the very minimum, it
          should be wrapped in a span
        </p>
      </article>
      <article>
        <h3>Element</h3>
        <p>A element becomes flex when layout is set. default row</p>
        <p>A row is full width and a vertically stacked container</p>
      </article>
      <article>
        <h3>Row</h3>
        <p>A row is full width and a vertically stacked container</p>
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
          <li>3. Sets your min-width not to get smaller than an iphone</li>
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
        <p>.box.-x</p>
        <p>.box.-x@$bp</p>
        <p>.box._x</p>
        <p>.box._x@$bp</p>
        <p>.box > .-x</p>
        <p>.box > .-x@$bp</p>
      </div>
    </div>
  </div>
</section>
