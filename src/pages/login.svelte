<script>
  import Toolbelt from '@frontierjs/toolbelt'
  import { onMount } from 'svelte'
  import { auth } from '$frontier'
  import { Field } from '$frontier-c'
  import { goto } from '$router'

  let form = {}

  console.log({ env: Toolbelt.env.get })
  onMount(() => {
    form = { email: '', password: '' }
  })

  function checkForm(e) {
    //currently only checks one at a time
    let target = e.target,
      form
    while (!form) {
      if (target.tagName === 'FORM') form = target
      else
        target.tagName === 'BODY'
          ? (form = 'not found')
          : (target = target.parentElement)
    }

    for (let el of form) {
      if (el.willValidate && !el.checkValidity()) return el.reportValidity()
    }
  }

  function login(e) {
    e.preventDefault()
    console.log({ e })
    //TODO if (event.target.valid) //add to @frontierjs/frontend
    // if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
    if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
  }
</script>

<section debug class="bps-debug box _x">
  <form class="">
    <Field
      classes=""
      name="email"
      type="email"
      bind:value={form.email}
      required="true" />
    <Field
      classes=""
      name="password"
      type="password"
      bind:value={form.password}
      required="true" />
    <button class="el -l" on:mouseenter={checkForm} on:click={login}>
      Enter
    </button>
  </form>
</section>
