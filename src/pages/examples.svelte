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
</script>

<div class="grid columns -gap">
  <form class="">
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
</div>
<br />
<br />
<hr />
<br />
